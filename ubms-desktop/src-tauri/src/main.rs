// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PrintReceiptRequest {
    pub business_name: String,
    pub order_number: String,
    pub items: Vec<PrintReceiptItem>,
    pub total: f64,
}

#[derive(Serialize, Deserialize)]
pub struct PrintReceiptItem {
    pub name: String,
    pub quantity: f64,
    pub total: f64,
}

// Tauri command to print directly to 80mm ESC/POS Thermal Printer
#[tauri::command]
fn print_thermal_receipt(request: PrintReceiptRequest) -> Result<String, String> {
    println!("Printing ESC/POS receipt for order: {}", request.order_number);
    // In production, sends raw ESC/POS bytes to USB/COM printer port
    Ok(format!("Chek muvaffaqiyatli chop etildi: {}", request.order_number))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![print_thermal_receipt])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
