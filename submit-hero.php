<?php
header('Content-Type: application/json');

// Enable error reporting for debugging (remove in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Add at the top of the file
file_put_contents('debug.log', date('Y-m-d H:i:s') . " - Contact form submission\n", FILE_APPEND);
file_put_contents('debug.log', "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);

// Validate request method
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get email from form
$email = $_POST['email'] ?? '';

// Validate required field
if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Prepare email content
$to = "hello@snowtech.agency"; // Replace with your Bluehost email
$subject = "New Timeline & Quote Request";

$emailContent = "New Timeline & Quote Request\n\n";
$emailContent .= "Email: $email\n";
$emailContent .= "Source: Homepage Hero Form";

// Email headers
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