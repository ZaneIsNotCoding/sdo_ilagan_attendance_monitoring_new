import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import { Button } from "@/Components/ui/button";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import DepEdLogo from "@/Components/DepEdLogo";

const Login = ({ status, canResetPassword }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Log in" />

            {/* Page Background */}
            <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
                {/* Main Container (Smaller + Balanced) */}
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2">
                    {/* LEFT SIDE */}
                    <div className="hidden lg:flex flex-col items-center justify-center px-10 py-12 bg-blue-50 border-r border-gray-200 text-center">
                        {/* Logo (slightly higher) */}
                        <div className="mb-6 -mt-6">
                            <DepEdLogo className="w-44 object-contain mx-auto" />
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-blue-700 leading-snug">
                                TimeVault
                            </h1>

                            <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                                Secured Attendance and Tardiness Data with
                                Biometrics
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-col items-center justify-center px-8 py-12 bg-white">
                        <ApplicationLogo className="h-14 w-auto mb-3" />

                        {/* Login Card */}
                        <div className="w-full max-w-xs bg-white shadow-md rounded-lg p-5 border border-gray-100">
                            <h3 className="text-center font-semibold text-gray-700 mb-5 text-sm">
                                Log In
                            </h3>

                            {status && (
                                <div className="mb-4 text-sm text-green-600 text-center">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="text"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Button */}
                                <Button
                                    variant="blue"
                                    disabled={processing}
                                    className="w-full h-10 rounded-md text-sm"
                                >
                                    Log In
                                </Button>

                                {canResetPassword && (
                                    <div className="text-center mt-3">
                                        <Link
                                            href={route("password.request")}
                                            className="text-xs text-gray-500 hover:text-gray-800 underline"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-xs text-gray-400 text-center">
                            © 2025 Isabela State University — Ilagan Campus{" "}
                            <br />
                            All Rights Reserved
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

