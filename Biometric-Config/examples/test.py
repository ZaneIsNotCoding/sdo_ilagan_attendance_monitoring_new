import asyncio
import logging
import json
from datetime import datetime

logger = logging.getLogger("FingerprintService")
last_scan_times = {}

async def test_fingerprint(service):
    """SSE fingerprint test: returns fingerprint ID + employee details, no attendance logging."""

    HEARTBEAT_INTERVAL = 5
    MATCH_THRESHOLD = 60

    # 🔹 Load all fingerprints into SDK memory
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

            # 🔹 Heartbeat
            if (now - last_heartbeat).total_seconds() >= HEARTBEAT_INTERVAL:
                yield "data: {}\n\n"
                last_heartbeat = now

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
                    yield f"data: {json.dumps({'success': False, 'message': 'Fingerprint not recognized'})}\n\n"
                    continue

                # 🔹 Get employee ID
                service.cursor.execute("SELECT employee_id FROM biometrics WHERE id=%s", (fid,))
                row = service.cursor.fetchone()
                if not row:
                    yield f"data: {json.dumps({'success': False, 'message': 'Fingerprint recognized but no employee linked'})}\n\n"
                    continue

                employee_id = row[0]

                # 🔹 Fetch employee info
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

                # ✅ Return fingerprint ID + employee details
                logger.info(f"✅ Test Match → employee_id={employee_id}, fid={fid}, score={score}")
                yield f"data: {json.dumps({'success': True, 'finger_id': fid, 'score': score, 'employee': employee_data})}\n\n"

            except Exception as e:
                logger.error(f"Test failed: {e}")
                yield f"data: {json.dumps({'success': False, 'message': f'System error: {str(e)}'})}\n\n"
                await asyncio.sleep(0.1)
                continue

            await asyncio.sleep(0.05)

    except asyncio.CancelledError:
        logger.info("SSE test connection closed by client.")
        raise
