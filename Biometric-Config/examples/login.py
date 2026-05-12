import asyncio
import logging
import json
from datetime import datetime, time

logger = logging.getLogger("FingerprintService")
last_scan_times = {}

COOLDOWN_SECONDS =0

async def login_with_fingerprint(service):
    """Handles fingerprint login and attendance recording asynchronously with SSE."""

    AM_CUTOFF_HOUR = 13
    HEARTBEAT_INTERVAL = 50.
    MATCH_THRESHOLD = 60
    force_pm = False

    try:
        service.zkfp2.DBClear()
        service.cursor.execute("SELECT id, employee_id, fingerprint_template FROM biometrics")
        rows = service.cursor.fetchall()

        for fid, employee_id, template in rows:
            if not template:
                continue
            if isinstance(template, memoryview):
                template = template.tobytes()

            service.zkfp2.DBAdd(fid, template)
            logger.info(f"✅ Loaded fingerprint: fid={fid}, employee_id={employee_id}")

        logger.info(f"✅ Finished loading {len(rows)} fingerprints into zkfp2 memory.")
    except Exception as e:
        logger.error(f"Error loading fingerprints into SDK memory: {e}")

    try:
        last_heartbeat = datetime.now()
        while True:
            now = datetime.now()

            # 🔹 Send heartbeat every HEARTBEAT_INTERVAL seconds
            if (now - last_heartbeat).total_seconds() >= HEARTBEAT_INTERVAL:
                yield "data: {}\n\n"
                last_heartbeat = now

            # --- Acquire fingerprint asynchronously ---
            try:
                capture = await asyncio.to_thread(service.zkfp2.AcquireFingerprint)
            except Exception as e:
                logger.error(f"Fingerprint capture error: {e}")
                await asyncio.sleep(0.1)
                continue

            if not capture:
                await asyncio.sleep(0.1)
                continue

            tmp, _ = capture
            try:
                fid, score = service.zkfp2.DBIdentify(tmp)

                if fid == -1 or score < MATCH_THRESHOLD:
                    logger.info(f"❌ Scan result → No match (score={score})")
                    yield f"data: {json.dumps({'success': False, 'message': ' Fingerprint not recognized'})}\n\n"
                    continue

                # 🔹 Get employee ID
                service.cursor.execute("SELECT employee_id FROM biometrics WHERE id=%s", (fid,))
                row = service.cursor.fetchone()
                if not row:
                    logger.info(f"⚠️ Scan result → fid={fid}, no linked employee")
                    yield f"data: {json.dumps({'success': False, 'message': 'Fingerprint recognized but no employee linked'})}\n\n"
                    continue

                employee_id = row[0]

                # ✅ Log scan
                logger.info(f"🔍 Scan result → fid={fid}, employee_id={employee_id}, score={score}")

                now = datetime.now()

                # 🔹 Fetch employee info first
                service.cursor.execute("""
                    SELECT e.id, e.first_name, e.middle_name, e.last_name, e.position, e.work_type, o.id, o.name
                    FROM employees e
                    LEFT JOIN offices o ON o.id = e.office_id
                    WHERE e.id=%s
                """, (employee_id,))
                emp_row = service.cursor.fetchone()
                if not emp_row:
                    yield f"data: {json.dumps({'success': False, 'message': 'Employee not found in database'})}\n\n"
                    continue

                employee_data = {
                    "id": emp_row[0],
                    "first_name": emp_row[1],
                    "middle_name": emp_row[2],
                    "last_name": emp_row[3],
                    "position": emp_row[4],
                    "work_type": emp_row[5],
                    "office": {
                        "id": emp_row[6],
                        "name": emp_row[7],
                    } if emp_row[6] else None,
                }

                # ✅ Cooldown check AFTER employee_data exists
                if employee_id in last_scan_times:
                    if (now - last_scan_times[employee_id]).total_seconds() < COOLDOWN_SECONDS:
                        yield f"data: {json.dumps({'success': False, 'message': 'Scan ignored: you have already scanned recently. Kindly check the log table.', 'employee': employee_data})}\n\n"
                        continue
                last_scan_times[employee_id] = now

                # --- Attendance record ---
                today = now.date()
                current_time = now.strftime("%H:%M:%S")

                service.cursor.execute(
                    "SELECT id FROM attendances WHERE employee_id=%s AND date=%s LIMIT 1",
                    (employee_id, today)
                )
                attendance = service.cursor.fetchone()
                if not attendance:
                    service.cursor.execute(
                        "INSERT INTO attendances (employee_id, date, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
                        (employee_id, today)
                    )
                    service.conn.commit()
                    attendance_id = service.cursor.lastrowid
                else:
                    attendance_id = attendance[0]

                # --- Determine session ---
                service.cursor.execute(
                    "SELECT id, am_time_in, am_time_out FROM attendance_ams WHERE attendance_id=%s LIMIT 1",
                    (attendance_id,)
                )
                am_record = service.cursor.fetchone()

                # ✅ Case: Employee already AM time-in, but it's past 1 PM and no AM time-out yet
                if am_record and am_record[1] and not am_record[2] and now.hour >= AM_CUTOFF_HOUR:
                    yield f"data: {json.dumps({'success': True, 'prompt': True, 'prompt_type': 'AM', 'message': 'You scanned after 1 PM. Do you want to record AM Time-Out or PM Time-In?', 'options': ['AM Time-Out', 'PM Time-In'], 'employee': employee_data})}\n\n"
                    continue
                
                if now.hour >= 12 and (not am_record or not am_record[1] or (am_record[1] and am_record[2])):
                    force_pm = True

                if now.hour < AM_CUTOFF_HOUR and not force_pm:
                    # --- AM session logic ---
                    if not am_record:
                        # Record AM time-in
                        service.cursor.execute(
                            "INSERT INTO attendance_ams (attendance_id, am_time_in, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
                            (attendance_id, current_time)
                        )
                        service.conn.commit()
                        yield f"data: {json.dumps({'success': True, 'message': 'AM time-in recorded', 'session': 'AM','action': 'time-in', 'employee': employee_data})}\n\n"
                    elif am_record[1] and not am_record[2]:
                        # Record AM time-out
                        service.cursor.execute(
                            "UPDATE attendance_ams SET am_time_out=%s, updated_at=NOW() WHERE id=%s",
                            (current_time, am_record[0])
                        )
                        service.conn.commit()
                        yield f"data: {json.dumps({'success': True, 'message': 'AM time-out recorded', 'session': 'AM','action': 'time-out', 'employee': employee_data})}\n\n"
                else:
                    # --- PM session logic ---
                    service.cursor.execute(
                        "SELECT id, pm_time_in, pm_time_out FROM attendance_pms WHERE attendance_id=%s LIMIT 1",
                        (attendance_id,)
                    )
                    pm_record = service.cursor.fetchone()


                    if not pm_record:
                        # Record PM time-in
                        service.cursor.execute(
                            "INSERT INTO attendance_pms (attendance_id, pm_time_in, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
                            (attendance_id, current_time)
                        )
                        service.conn.commit()
                        yield f"data: {json.dumps({'success': True, 'message': 'PM time-in recorded', 'session': 'PM','action': 'time-in', 'employee': employee_data})}\n\n"
                    elif pm_record[1] and not pm_record[2]:
                        # Record PM time-out
                        service.cursor.execute(
                            "UPDATE attendance_pms SET pm_time_out=%s, updated_at=NOW() WHERE id=%s",
                            (current_time, pm_record[0])
                        )
                        service.conn.commit()
                        yield f"data: {json.dumps({'success': True, 'message': 'PM time-out recorded', 'session': 'PM','action': 'time-out', 'employee': employee_data})}\n\n"

            except Exception as e:
                logger.error(f"Login failed: {e}")
                yield f"data: {json.dumps({'success': False, 'message': f'System error: {str(e)}'})}\n\n"
                await asyncio.sleep(0.1)
                continue

            await asyncio.sleep(0.05)  # small non-blocking delay

    except asyncio.CancelledError:
        logger.info("SSE connection closed by client.")
        raise
