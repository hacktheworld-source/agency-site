<?php
// Ensure we're sending JSON response
header('Content-Type: application/json');

try {
    // Log the form submission for debugging
    $log_file = 'form_submissions.log';
    $submission_data = [
        'time' => date('Y-m-d H:i:s'),
        'name' => $_POST['name'] ?? 'not provided',
        'email' => $_POST['email'] ?? 'not provided',
        'project_type' => $_POST['project-type'] ?? 'not provided',
        'timeline' => $_POST['timeline'] ?? 'not provided',
        'message' => substr($_POST['message'] ?? 'not provided', 0, 100) . '...'
    ];
    
    $log_entry = json_encode($submission_data) . "\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Form submission received. This is a test version that logs but does not send emails.'
    ]);

} catch (Exception $e) {
    // Send error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Ensure we exit after sending response
exit; 