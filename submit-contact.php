<?php
// Ensure we're sending JSON response
header('Content-Type: application/json');

// Prevent any output before our JSON response
ob_start();

try {
    // Validate request method
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        throw new Exception('Method not allowed');
    }

    // Get form data
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $projectType = $_POST['project-type'] ?? '';
    $timeline = $_POST['timeline'] ?? '';
    $message = $_POST['message'] ?? '';

    // Validate required fields
    if (empty($name) || empty($email) || empty($projectType) || empty($timeline) || empty($message)) {
        throw new Exception('All fields are required');
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Prepare email content
    $to = "hello@snowtech.agency";
    $subject = "New Project Inquiry from $name";
    $emailContent = "New Project Inquiry\n\n";
    $emailContent .= "Name: $name\n";
    $emailContent .= "Email: $email\n";
    $emailContent .= "Project Type: $projectType\n";
    $emailContent .= "Timeline: $timeline\n\n";
    $emailContent .= "Message:\n$message";

    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send email
    if (!mail($to, $subject, $emailContent, $headers)) {
        throw new Exception('Failed to send email');
    }

    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }

    // Send success response
    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);

} catch (Exception $e) {
    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }

    // Send error response
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Ensure we exit after sending response
exit; 