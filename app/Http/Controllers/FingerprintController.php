<?php

namespace App\Http\Controllers;

use App\Models\Administrator\Employee;
use App\Models\Biometric;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FingerprintController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'samples' => ['required', 'array', 'size:3'],
        ]);

        try {
            $employee = Employee::findOrFail($request->employee_id);

            $existingCount = Biometric::where('employee_id', $employee->id)->count();

            if ($existingCount >= 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'This employee already has 3 registered fingerprints.',
                ], 422);
            }

            $fingerIndex = $existingCount + 1;

            $normalizedTemplate = json_encode([
                'captures' => array_map(
                    fn ($sample) => $this->normalizeSample($sample),
                    $request->samples
                ),
            ], JSON_UNESCAPED_SLASHES);

            Biometric::create([
                'employee_id' => $employee->id,
                'finger_index' => $fingerIndex,
                'fingerprint_template' => $normalizedTemplate,
            ]);

            if (isset($employee->available_fingers)) {
                $employee->available_fingers = max(3 - $fingerIndex, 0);
                $employee->save();
            }

            Log::info('Fingerprint registered', [
                'employee_id' => $employee->id,
                'finger_index' => $fingerIndex,
                'captures_count' => count($request->samples),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Fingerprint {$fingerIndex} registered successfully with 3 scans.",
            ]);
        } catch (\Throwable $e) {
            Log::error('Fingerprint registration failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to save fingerprint.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function test(Request $request)
    {
        $request->validate([
            'samples' => ['required', 'array', 'min:1'],
        ]);

        try {
            $match = $this->findMatchingEmployeeFromSample($request->samples[0], 1);

            if ($match) {
                return response()->json([
                    'success' => true,
                    'message' => 'Fingerprint matched successfully.',
                    'employee' => $match['employee'],
                    'score' => $match['score'],
                    'capture_index' => $match['capture_index'],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No matching fingerprint found.',
            ]);
        } catch (\Throwable $e) {
            Log::error('Fingerprint test failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Fingerprint test failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    private function extractFingerprintMeta($sample): array
    {
        if (is_string($sample)) {
            $decoded = json_decode($sample, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $sample = $decoded;
            } else {
                return [
                    'data_length' => strlen(trim($sample)),
                    'data_preview' => substr(trim($sample), 0, 150),
                    'version' => null,
                    'type' => null,
                    'quality' => null,
                    'format_owner' => null,
                    'format_id' => null,
                ];
            }
        }

        if (is_object($sample)) {
            $sample = (array) $sample;
        }

        $header = $sample['Header'] ?? [];
        $format = $header['Format'] ?? [];

        return [
            'data_length' => strlen((string) ($sample['Data'] ?? '')),
            'data_preview' => substr((string) ($sample['Data'] ?? ''), 0, 150),
            'version' => $sample['Version'] ?? null,
            'type' => $header['Type'] ?? null,
            'quality' => $header['Quality'] ?? null,
            'format_owner' => $format['FormatOwner'] ?? null,
            'format_id' => $format['FormatID'] ?? null,
        ];
    }
    public function testThree(Request $request)
    {
        $request->validate([
            'samples' => ['required', 'array', 'size:3'],
        ]);

        try {
            $samples = $request->samples;

            $normalized = array_map(
                fn ($sample) => $this->extractFingerprintMeta($sample),
                $samples
            );

            $allReceived = count($normalized) === 3
                && collect($normalized)->every(fn ($item) => !empty($item['data_length']));

            $sameVersion = count(array_unique(array_column($normalized, 'version'))) === 1;
            $sameType = count(array_unique(array_column($normalized, 'type'))) === 1;
            $sameFormatOwner = count(array_unique(array_column($normalized, 'format_owner'))) === 1;
            $sameFormatId = count(array_unique(array_column($normalized, 'format_id'))) === 1;

            Log::info('Fingerprint capture diagnostic', [
                'all_received' => $allReceived,
                'same_version' => $sameVersion,
                'same_type' => $sameType,
                'same_format_owner' => $sameFormatOwner,
                'same_format_id' => $sameFormatId,
                'samples' => $normalized,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fingerprint samples captured successfully.',
                'result' => [
                    'ready_for_enrollment' => $allReceived,
                    'capture_count' => count($normalized),
                    'all_received' => $allReceived,
                    'same_version' => $sameVersion,
                    'same_type' => $sameType,
                    'same_format_owner' => $sameFormatOwner,
                    'same_format_id' => $sameFormatId,
                    'samples' => $normalized,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Fingerprint capture diagnostic failed', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Fingerprint capture diagnostic failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    private function normalizeFingerprintData($sample): string
    {
        if (is_string($sample)) {
            $decoded = json_decode($sample, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $sample = $decoded;
            } else {
                return trim($sample);
            }
        }

        if (is_object($sample)) {
            $sample = (array) $sample;
        }

        if (is_array($sample)) {
            return trim((string) ($sample['Data'] ?? json_encode($sample, JSON_UNESCAPED_SLASHES)));
        }

        return trim((string) $sample);
    }
    private function extractStoredCaptureData($template): array
    {
        if (is_resource($template)) {
            $template = stream_get_contents($template);
        }

        $template = (string) $template;
        $decoded = json_decode($template, true);

        if (!is_array($decoded)) {
            return [];
        }

        $captures = $decoded['captures'] ?? [];

        if (!is_array($captures)) {
            return [];
        }

        return array_map(function ($capture) {
            if (is_string($capture)) {
                $decodedCapture = json_decode($capture, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    $capture = $decodedCapture;
                } else {
                    return trim($capture);
                }
            }

            if (is_object($capture)) {
                $capture = (array) $capture;
            }

            if (is_array($capture)) {
                return trim((string) ($capture['Data'] ?? json_encode($capture, JSON_UNESCAPED_SLASHES)));
            }

            return trim((string) $capture);
        }, $captures);
    }

    private function findMatchingEmployeeFromSample($sample, int $testIndex = 1): ?array
    {
        $normalizedSample = $this->normalizeFingerprintData($sample);

        Log::info('Fingerprint test incoming', [
            'test_index' => $testIndex,
            'sample_preview' => substr($normalizedSample, 0, 150),
            'sample_length' => strlen($normalizedSample),
        ]);

        $biometrics = Biometric::with('employee')->get();

        $bestMatch = null;
        $highestScore = 0;

        foreach ($biometrics as $biometric) {
            $storedCaptures = $this->extractStoredCaptureData($biometric->fingerprint_template);

            foreach ($storedCaptures as $captureIndex => $storedCapture) {
                similar_text($storedCapture, $normalizedSample, $percent);

                Log::info('Comparing fingerprint capture', [
                    'test_index' => $testIndex,
                    'biometric_id' => $biometric->id,
                    'employee_id' => $biometric->employee_id,
                    'capture_index' => $captureIndex + 1,
                    'similarity_percent' => round($percent, 2),
                ]);

                if ($percent > $highestScore) {
                    $highestScore = $percent;

                    $bestMatch = [
                        'employee_id' => $biometric->employee_id,
                        'employee' => [
                            'id' => $biometric->employee->id,
                            'first_name' => $biometric->employee->first_name,
                            'middle_name' => $biometric->employee->middle_name,
                            'last_name' => $biometric->employee->last_name,
                            'position' => $biometric->employee->position,
                            'office' => $biometric->employee->office,
                        ],
                        'score' => round($percent, 2),
                        'capture_index' => $captureIndex + 1,
                    ];
                }
            }
        }

        Log::info('Fingerprint best candidate result', [
            'test_index' => $testIndex,
            'highest_score' => round($highestScore, 2),
            'best_match_employee_id' => $bestMatch['employee_id'] ?? null,
            'capture_index' => $bestMatch['capture_index'] ?? null,
        ]);

        return $bestMatch;
    }

    private function extractStoredCaptures($template): array
    {
        if (is_resource($template)) {
            $template = stream_get_contents($template);
        }

        $template = (string) $template;
        $decoded = json_decode($template, true);

        if (!is_array($decoded)) {
            return [];
        }

        $captures = $decoded['captures'] ?? [];

        if (!is_array($captures)) {
            return [];
        }

        return array_map(function ($capture) {
            return $this->normalizeSample($capture);
        }, $captures);
    }

    private function normalizeSample($sample): string
    {
        if (is_string($sample)) {
            $decoded = json_decode($sample, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $sample = $decoded;
            } else {
                return trim($sample);
            }
        }

        if (is_object($sample)) {
            $sample = (array) $sample;
        }

        if (is_array($sample)) {
            $sample = $this->sortRecursive($sample);
            return json_encode($sample, JSON_UNESCAPED_SLASHES);
        }

        return json_encode($sample, JSON_UNESCAPED_SLASHES);
    }

    private function sortRecursive($data)
    {
        if (!is_array($data)) {
            return $data;
        }

        foreach ($data as $key => $value) {
            $data[$key] = $this->sortRecursive($value);
        }

        ksort($data);

        return $data;
    }
}
