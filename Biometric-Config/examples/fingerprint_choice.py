import logging
import json
from datetime import datetime

logger = logging.getLogger("FingerprintChoiceService")

def fingerprint_choice(service, employee_id: int, choice: str):
    """
    Handles AM Time-Out or PM Time-In recording asynchronously and returns SSE messages.
    """
    try:
        now = datetime.now()
        today = now.date()
        current_time = now.strftime("%H:%M:%S")

        # --- Fetch today's attendance record ---
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

        # --- Fetch employee info ---
        service.cursor.execute("""
            SELECT e.id, e.first_name, e.middle_name, e.last_name, e.position, e.work_type, o.id, o.name
            FROM employees e
            LEFT JOIN offices o ON o.id = e.office_id
            WHERE e.id=%s
        """, (employee_id,))
        emp_row = service.cursor.fetchone()
        if not emp_row:
            yield f"data: {json.dumps({'success': False, 'message': 'Employee not found'})}\n\n"
            return

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

        # --- Handle choice ---
        if choice == "AM Time-Out":
            service.cursor.execute(
                "SELECT id, am_time_in, am_time_out FROM attendance_ams WHERE attendance_id=%s LIMIT 1",
                (attendance_id,)
            )
            am_record = service.cursor.fetchone()
            if am_record and not am_record[2]:
                service.cursor.execute(
                    "UPDATE attendance_ams SET am_time_out=%s, updated_at=NOW() WHERE id=%s",
                    (current_time, am_record[0])
                )
                service.conn.commit()
                yield f"data: {json.dumps({'success': True, 'message': 'AM Time-Out recorded', 'session': 'AM', 'action': 'time-out', 'employee': employee_data})}\n\n"
            else:
                yield f"data: {json.dumps({'success': False, 'message': 'AM Time-Out already recorded', 'employee': employee_data})}\n\n"

        elif choice == "PM Time-In":
            service.cursor.execute(
                "SELECT id, pm_time_in, pm_time_out FROM attendance_pms WHERE attendance_id=%s LIMIT 1",
                (attendance_id,)
            )
            pm_record = service.cursor.fetchone()
            if not pm_record:
                service.cursor.execute(
                    "INSERT INTO attendance_pms (attendance_id, pm_time_in, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
                    (attendance_id, current_time)
                )
                service.conn.commit()
                yield f"data: {json.dumps({'success': True, 'message': 'PM Time-In recorded', 'session': 'PM', 'action': 'time-in', 'employee': employee_data})}\n\n"
            elif not pm_record[1]:
                service.cursor.execute(
                    "UPDATE attendance_pms SET pm_time_in=%s, updated_at=NOW() WHERE id=%s",
                    (current_time, pm_record[0])
                )
                service.conn.commit()
                yield f"data: {json.dumps({'success': True, 'message': 'PM Time-In recorded', 'session': 'PM', 'action': 'time-in', 'employee': employee_data})}\n\n"
            else:
                yield f"data: {json.dumps({'success': False, 'message': 'PM Time-In already recorded', 'employee': employee_data})}\n\n"

        elif choice == "PM Time-Out":
            service.cursor.execute(
                "SELECT id, pm_time_in, pm_time_out FROM attendance_pms WHERE attendance_id=%s LIMIT 1",
                (attendance_id,)
            )
            pm_record = service.cursor.fetchone()
            if not pm_record or not pm_record[1]:
                yield f"data: {json.dumps({'success': False, 'message': 'Cannot record PM Time-Out before PM Time-In', 'employee': employee_data})}\n\n"
                return
            elif pm_record[2]:
                yield f"data: {json.dumps({'success': False, 'message': 'PM Time-Out already recorded', 'employee': employee_data})}\n\n"
                return
            else:
                service.cursor.execute(
                    "UPDATE attendance_pms SET pm_time_out=%s, updated_at=NOW() WHERE id=%s",
                    (current_time, pm_record[0])
                )
                service.conn.commit()
                yield f"data: {json.dumps({'success': True, 'message': 'PM Time-Out recorded', 'session': 'PM', 'action': 'time-out', 'employee': employee_data})}\n\n"

    except Exception as e:
        logger.error(f"Error recording choice: {e}")
        yield f"data: {json.dumps({'success': False, 'message': f'Server error: {str(e)}'})}\n\n"
