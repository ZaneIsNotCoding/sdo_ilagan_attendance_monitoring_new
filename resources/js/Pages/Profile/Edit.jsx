import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile</h2>}
        >
            <Head title="Profile Edit" />

            <div className="flex min-h-screen bg-gray-100">
                {/* Main Content */}

                <main className="flex-1 p-6 space-y-6">
                    <div className="space-y-6">
                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="bg-white p-4 shadow sm:rounded-lg sm:p-6">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </main>

            </div>
        </AuthenticatedLayout>
    );
}

