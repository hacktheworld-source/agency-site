<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Add logging
file_put_contents('debug.log', date('Y-m-d H:i:s') . " - Contact form submission\n", FILE_APPEND);
file_put_contents('debug.log', "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);

// Validate request method
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get form data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$projectType = $_POST['project-type'] ?? '';
$timeline = $_POST['timeline'] ?? '';
$message = $_POST['message'] ?? '';

// Validate required fields
if (empty($name) || empty($email) || empty($projectType) || empty($timeline) || empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
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

// Use the working email headers format from submit-hero.php
$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
try {
    file_put_contents('debug.log', "Attempting to send mail to: $to\n", FILE_APPEND);
    if (mail($to, $subject, $emailContent, $headers)) {
        file_put_contents('debug.log', "Mail sent successfully\n", FILE_APPEND);
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    } else {
        file_put_contents('debug.log', "Mail failed to send\n", FILE_APPEND);
        throw new Exception('Failed to send email');
    }
} catch (Exception $e) {
    file_put_contents('debug.log', "Error: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
} 