<?php

use App\Http\Controllers\Administrator\{
    AttendanceController,
    DailyTimeRecordController,
    EmployeeManagementController,
    TardinessRecordController,
    AttendanceManagementController,
    DepartmentManagementController,
    StationManagementController
};
use App\Http\Controllers\HumanResource\{
    TardyConvertionController,
    ConvertedTardyRecordsController,
    EmployeeLeaveCardController,
    VacationLeaveController,
    SickLeaveController,
};
use App\Http\Controllers\AttendanceMonitoringController;
use App\Http\Controllers\ApplicationForLeaveController;
use App\Http\Controllers\EmployeeLeaveController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SlipMonitoringController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LocatorSlipController;
use App\Http\Controllers\TravelOrderController;
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('landing');

Route::get('/landing', fn () => Inertia::render('LandingPage'))->name('landing');

Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance');

Route::get('/attendance-monitoring', [AttendanceMonitoringController::class, 'index'])->name('attendance-monitoring');
Route::get('/attendance-monitoring/stations/suggestions', [AttendanceMonitoringController::class, 'stationSuggestions'])->name('attendance-monitoring.stations.suggestions');
Route::get('/attendance-monitoring/employees/suggestions', [AttendanceMonitoringController::class, 'employeeSuggestions'])->name('attendance-monitoring.employees.suggestions');


Route::get('/employee/locator-slip', [LocatorSlipController::class, 'index'])
    ->name('locator-slips');
Route::post('/employee/locator-slip', [LocatorSlipController::class, 'store'])
    ->name('locator-slips.store');
Route::get('/travel-order', [TravelOrderController::class, 'index'])
    ->name('travelorder');
Route::post('/employee/travel-order', [TravelOrderController::class, 'store'])
    ->name('travelorder.store');
Route::get('/employee/application-leave', [ApplicationForLeaveController::class, 'index'])
    ->name('application-leave');
Route::post('/employee/application-leave', [ApplicationForLeaveController::class, 'store'])
    ->name('application-leave.store');

/*
|--------------------------------------------------------------------------
| Authenticated & Verified Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:sdo_admin|sdo_hr|school_admin'])->group(function () {

    //Attendance Management
    Route::get('/attendancemanagement', [AttendanceManagementController::class, 'index'])->name('attendancemanagement');
    Route::post('/attendancemanagement/{id}/update', [AttendanceManagementController::class, 'update'])->name('attendancemanagement.update');
    Route::post('attendancemanagement/create', [AttendanceManagementController::class, 'store'])->name('attendancemanagement.create');
    Route::post('/attendance/leave', [EmployeeLeaveController::class, 'store'])->name('attendance.leave.store');
    Route::delete('/attendance/leave', [EmployeeLeaveController::class, 'destroy']);

    // Daily Time Records
    Route::get('/dailytimerecord', [DailyTimeRecordController::class, 'index'])->name('dailytimerecord');
    Route::get('/dailytimerecord/suggestions', [DailyTimeRecordController::class, 'suggestions'])->name('dailytimerecord.suggestions');
    Route::get('/dailytimerecord/{employeeId}-{first_name}', [DailyTimeRecordController::class, 'show'])->name('dailytimerecord.show');
    Route::get('/dailytimerecord/details/{employeeId}', [DailyTimeRecordController::class, 'details'])->name('dailytimerecord.details');

    // Admin Tardy Records
    Route::get('/tardysummary', [TardinessRecordController::class, 'index'])->name('tardysummary');

    // HR Tardy Records
    Route::get('/tardyarchieve', [ConvertedTardyRecordsController::class, 'index'])->name('tardyarchieve');
    Route::get('/tardyarchieve/{batch}', [ConvertedTardyRecordsController::class, 'show'])->name('batch-record');

    // HR Tardy Conversion
    Route::get('/tardyconvertion', [TardyConvertionController::class, 'index'])->name('tardyconvertion');
    Route::post('/tardy-convertions', [TardyConvertionController::class, 'store'])->name('tardy-convertions');

    //Employee Managements
    Route::get('/employeemanagement/suggestions', [EmployeeManagementController::class, 'suggestions'])->name('employees.suggestions');
    Route::get('/employeemanagement/list', [EmployeeManagementController::class, 'list'])->name('employees.list');
    Route::get('/employeemanagement', [EmployeeManagementController::class, 'index'])->name('employeemanagement');
    Route::post('/employeestore', [EmployeeManagementController::class, 'store'])->name('employees.store');
    Route::put('/employeeedit/{id}', [EmployeeManagementController::class, 'update'])->name('employees.update');

    //Leave Card
    Route::get('/employeeleavecard', [EmployeeLeaveCardController::class, 'index'])->name('employeeleavecard');
    Route::get('/employeeleavecard/{id}-{name}', [EmployeeLeaveCardController::class, 'show'])->name('employeeleavecard.show');
    Route::put('/employeeleavecard/{id}', [EmployeeLeaveCardController::class, 'update'])->name('employeeleavecard.update');
    Route::put('/vacationleaveupdate', [VacationLeaveController::class, 'update'])->name('vacation-leave.update');
    Route::put('/sickleaveupdate', [SickLeaveController::class, 'update'])->name('sick-leave.update');

    // Department Management
    Route::get('/departmentmanagement', [DepartmentManagementController::class, 'index'])->name('departmentmanagement');
    Route::get('/departmentmanagement/employees', [DepartmentManagementController::class, 'employeeCandidates'])->name('department.employees');
    Route::post('/departmentmanagement/depheadstore', [DepartmentManagementController::class, 'storeHead'])->name('departmenthead.storeHead');
    Route::post('/departmentmanagement/divisionheadstore', [DepartmentManagementController::class, 'storeDivisionHead'])->name('divisionhead.storeDivisionHead');
    Route::post('/departmentmanagement/addDepartment', [DepartmentManagementController::class, 'storeDepartment'])->name('division.storeDivision');
    Route::put('/departmentmanagement/updateDepartment/{id}', [DepartmentManagementController::class, 'updateDepartment'])->name('department.updateDepartment');
    Route::delete('/departmentmanagement/delete/{id}', [DepartmentManagementController::class, 'destroy'])->name('departmenthead.destroy');
    Route::delete('/departmentmanagement/division/delete/{id}', [DepartmentManagementController::class, 'destroyDivisionHead'])->name('divisionhead.destroy');
    Route::delete('/departmentmanagement/department/delete/{id}', [DepartmentManagementController::class, 'destroyDepartment'])->name('department.destroy');
    Route::post('/departmentmanagement/addOffice', [DepartmentManagementController::class, 'storeOffice'])->name('office.storeOffice');
    Route::put('/departmentmanagement/updateOffice/{id}', [DepartmentManagementController::class, 'updateOffice'])->name('office.updateOffice');
    Route::delete('/departmentmanagement/office/delete/{id}', [DepartmentManagementController::class, 'destroyOffice'])->name('office.destroy');
    Route::post('/departmentmanagement/suggest-names', [DepartmentManagementController::class, 'suggestDepartmentNames'])->name('departmentnames.suggest');

    //Station Management
    Route::get('/stations/suggestions', [StationManagementController::class, 'suggestions'])->name('stations.suggestions');
    Route::get('/stations/admin/list', [StationManagementController::class, 'adminRows'])->name('stationadmin.list');
    Route::get('/stations/list', [StationManagementController::class, 'stationRows'])->name('stations.list');
    Route::get('/stations', [StationManagementController::class, 'index'])->name('stationmanagement');
    Route::post('/stations', [StationManagementController::class, 'storeStation'])->name('stations.store');
    Route::get('/stations/admin/employees', [StationManagementController::class, 'adminEmployeeCandidates'])->name('stationadmin.employees');
    Route::post('/stations/admin', [StationManagementController::class, 'store'])->name('stationadmin.store');
    Route::delete('/stations/admin/{id}', [StationManagementController::class, 'destroy'])->name('stationadmin.destroy');
    Route::put('/station-assignments/{stationAssignment}', [StationManagementController::class, 'updateStationAssignment'])->name('stationassignments.update');
    Route::delete('/station-assignments/{stationAssignment}', [StationManagementController::class, 'destroyStationAssignment'])->name('stationassignments.destroy');
    Route::put('/stations/{station}', [StationManagementController::class, 'updateStation'])->name('stations.update');
    Route::delete('/stations/{station}', [StationManagementController::class, 'destroyStation'])->name('stations.destroy');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('position', PositionController::class);

    Route::get('/slip-monitoring', [SlipMonitoringController::class, 'index'])->name('slip-monitoring.index');
    Route::delete('/slip-monitoring/{type}/bulk-delete', [SlipMonitoringController::class, 'destroyMany'])->name('slip-monitoring.destroy-many');
    Route::delete('/slip-monitoring/{type}/{id}', [SlipMonitoringController::class, 'destroy'])->name('slip-monitoring.destroy');
});


Route::get('/test-role', function () {
    dd(auth()->user()->getRoleNames());
})->middleware('auth');



/*
|--------------------------------------------------------------------------
| Auth Routes (Login, Register, Password, etc.)
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
