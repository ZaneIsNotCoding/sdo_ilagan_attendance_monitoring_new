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
use App\Http\Controllers\FingerprintController;
use App\Http\Controllers\HumanResource\{
    TardyConvertionController,
    ConvertedTardyRecordsController,
    EmployeeLeaveCardController,
    VacationLeaveController,
    SickLeaveController,
};
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeLeaveController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
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
    if (Auth::check()) {
        return redirect()->route('employeemanagement');
    }
    return Inertia::render('Auth/Login', [
        'canRegister'      => Route::has('register'),
        'canResetPassword' => Route::has('password.request'),
        'laravelVersion'   => Application::VERSION,
        'phpVersion'       => PHP_VERSION,
    ]);
});

Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance');
Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
/*
|--------------------------------------------------------------------------
| Authenticated & Verified Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:sdo_admin|sdo_hr|school_admin'])->group(function () {

    //Attendance Management
    Route::get('/attendancemanagement', [AttendanceManagementController::class, 'index'])->name('attendancemanagement');

    Route::post('/attendancemanagement/{id}/update', [AttendanceManagementController::class, 'update'])
        ->name('attendancemanagement.update');
    Route::post('attendancemanagement/create', [AttendanceManagementController::class, 'store'])->name('attendancemanagement.create');

    Route::post('/attendance/leave', [EmployeeLeaveController::class, 'store'])
        ->name('attendance.leave.store');
    Route::delete('/attendance/leave', [EmployeeLeaveController::class, 'destroy']);


    // Daily Time Records
    Route::get('/dailytimerecord', [DailyTimeRecordController::class, 'index'])->name('dailytimerecord');
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
    Route::post('/departmentmanagement/depheadstore', [DepartmentManagementController::class, 'storeHead'])->name('departmenthead.storeHead');
    Route::post('/departmentmanagement/divisionheadstore', [DepartmentManagementController::class, 'storeDivisionHead'])->name('divisionhead.storeDivisionHead');
    Route::post('/departmentmanagement/addDepartment', [DepartmentManagementController::class, 'storeDepartment'])->name('division.storeDivision');
    Route::put('/departmentmanagement/updateDepartment/{id}', [DepartmentManagementController::class, 'updateDepartment'])->name('department.updateDepartment');
    Route::delete('/departmentmanagement/delete/{id}', [DepartmentManagementController::class, 'destroy'])->name('departmenthead.destroy');
    Route::delete('/departmentmanagement/division/delete/{id}', [DepartmentManagementController::class, 'destroyDivisionHead'])->name('divisionhead.destroy');
    Route::delete('/departmentmanagement/department/delete/{id}', [DepartmentManagementController::class, 'destroyDepartment'])
        ->name('department.destroy');
    Route::post('/departmentmanagement/addOffice', [DepartmentManagementController::class, 'storeOffice'])->name('office.storeOffice');
    Route::put('/departmentmanagement/updateOffice/{id}', [DepartmentManagementController::class, 'updateOffice'])->name('office.updateOffice');
    Route::delete('/departmentmanagement/office/delete/{id}', [DepartmentManagementController::class, 'destroyOffice'])->name('office.destroy');
    Route::post('/departmentmanagement/suggest-names', [DepartmentManagementController::class, 'suggestDepartmentNames'])->name('departmentnames.suggest');
    

    //Station Management
    Route::get('/stations', [StationManagementController::class, 'index'])->name('stationmanagement');
    Route::post('/stations', [StationManagementController::class, 'storeStation'])->name('stations.store');
    Route::post('/stations/admin', [StationManagementController::class, 'store'])->name('stationadmin.store');
    Route::delete('/stations/admin/{id}', [StationManagementController::class, 'destroy'])->name('stationadmin.destroy');
    Route::put('/station-assignments/{stationAssignment}', [StationManagementController::class, 'updateStationAssignment'])->name('stationassignments.update');
    Route::delete('/station-assignments/{stationAssignment}', [StationManagementController::class, 'destroyStationAssignment'])->name('stationassignments.destroy');
    Route::put('/stations/{station}', [StationManagementController::class, 'updateStation'])->name('stations.update');
    Route::delete('/stations/{station}', [StationManagementController::class, 'destroyStation'])->name('stations.destroy');


    Route::middleware(['auth'])->group(function () {
        Route::get('/employee/locator-slip', [LocatorSlipController::class, 'index'])
            ->name('locator-slips');

        Route::post('/employee/locator-slip', [LocatorSlipController::class, 'store'])
            ->name('locator-slips.store');
    });


    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::get('/travel-order', function () {
        return Inertia::render('Employee/TravelOrder/TravelOrderPage');
    })->name('travelorder');

    Route::resource('position', PositionController::class);
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
