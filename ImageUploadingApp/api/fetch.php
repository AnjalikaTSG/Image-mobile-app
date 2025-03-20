<?php
header('Content-Type: application/json'); // Ensure JSON response

$conn = new mysqli("localhost", "root", "", "image_uploads");

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$result = $conn->query("SELECT * FROM uploads ORDER BY timestamp DESC");
$data = [];

while ($row = $result->fetch_assoc()) {
    $row['image'] = "http://yourserver.com/uploads/" . $row['image']; // Full image URL
    $data[] = $row;
}

echo json_encode($data);
$conn->close();
?>
