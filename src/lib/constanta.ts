import { ReceiptElement } from "@/components/pages/PageStrukManualClient";

export const LIST_BANK = [
  "BCA", "BRI", "Mandiri", "BNI", "BSI", "BTN", "CIMB Niaga", 
  "Permata", "OCBC NISP", "Danamon", "Bank Mega", "BTPN", 
  "Bank Jago", "Allo Bank", "SeaBank", "Blu by BCA Digital"
];

export const SIDEBAR = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Layout Struk", href: "/dashboard/layout_list", icon: "LayersPlus" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
  { label: "History", href: "/dashboard/history", icon: "Timer" },  
]

export const ROLES = [
  { id: "1", label: "Admin", value: "admin" },
  { id: "2", label: "User", value: "user" }
]

export const NOT_SHOW_IN_PREVIEW = ['Hidden', 'total_keseluruhan', 'Admin_Fee', 'Store_Name'];
export const NOT_TASK_AI_TYPE_INPUT = ['Hidden', 'total_keseluruhan', 'Admin_Fee', 'Store_Name'];

export const DEFAULT_LOGO_RECEIPTS = "/image/upload/logo/defaultLogo.png";
export const DEFAULT_SETTINGS_FIRST_LOGIN = {
  "logo": DEFAULT_LOGO_RECEIPTS,
  "adminFee": {
    "type": "fixed",
    "ranges": [],
    "fixedValue": 2500,
    "multiplier": {
      "fee": 2500,
      "step": 10000
    }
  },
  "shopName": "StrukApp Digital",
  "reference": {
    "type": "limited",
    "digitLimit": 10
  }
}

export const DefaultConfigLayout: ReceiptElement[] = [
    {
      "id": "1",
      "type": "input_image",
      "width": 80,
      "height": 80,
      "source": "logo"
    },
    {
      "id": "2",
      "type": "input_text",
      "label": "NAMA TOKO",
      "showLabel": false,
      "dataType": "Store_Name",
      "position": "center",
      "labelLayout": "stacked",
      "fontSize": 20,
      "fontWeight": "900",
      "color": "#1a1a1a",
      "exampleValue": "NAMA TOKO ANDA",
      "hasBorder": false
    },
    {
      "id": "3",
      "type": "input_text",
      "label": "KODE REFERENSI",
      "showLabel": true,
      "dataType": "Referensi",
      "position": "center",
      "labelLayout": "stacked",
      "fontSize": 14,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "3436 6731 7054",
      "hasBorder": false
    },
    {
      "id": "4",
      "type": "separator",
      "style": "dash",
      "color": "#333333"
    },
    {
      "id": "5",
      "type": "input_text",
      "label": "TANGGAL",
      "showLabel": true,
      "dataType": "Date",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "2026-05-15"
    },
    {
      "id": "6",
      "type": "input_text",
      "label": "WAKTU",
      "showLabel": true,
      "dataType": "Time",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "22:56 WIB"
    },
    {
      "id": "7",
      "type": "separator",
      "style": "dash",
      "color": "#333333"
    },
    {
      "id": "8",
      "type": "text",
      "value": "DATA PENERIMA",
      "fontSize": 13,
      "fontWeight": "bold",
      "alignment": "center",
      "color": "#1a1a1a"
    },
    {
      "id": "9",
      "type": "input_text",
      "label": "NAMA",
      "showLabel": true,
      "dataType": "String",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "IVANS ISWAHYUDI"
    },
    {
      "id": "10",
      "type": "input_text",
      "label": "BANK",
      "showLabel": true,
      "dataType": "String",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "BCA"
    },
    {
      "id": "11",
      "type": "input_text",
      "label": "REKENING",
      "showLabel": true,
      "dataType": "String",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "1234567890"
    },
    {
      "id": "12",
      "type": "input_text",
      "label": "NOMINAL",
      "showLabel": true,
      "dataType": "Nominal",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "Rp 1.000.000"
    },
    {
      "id": "13",
      "type": "input_text",
      "label": "BIAYA ADMIN",
      "showLabel": true,
      "dataType": "Admin_Fee",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "Rp 2.500"
    },
    {
      "id": "14",
      "type": "input_text",
      "label": "STATUS",
      "showLabel": true,
      "dataType": "String",
      "position": "default",
      "labelLayout": "inline",
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#1a1a1a",
      "exampleValue": "BERHASIL"
    },
    {
      "id": "15",
      "type": "separator",
      "style": "dash",
      "color": "#333333"
    },
    {
      "id": "16",
      "type": "text",
      "value": "TOTAL KESELURUHAN",
      "fontSize": 12,
      "fontWeight": "normal",
      "alignment": "center",
      "color": "#1a1a1a"
    },
    {
      "id": "17",
      "type": "input_text",
      "label": "TOTAL KESELURUHAN",
      "showLabel": false,
      "dataType": "total_keseluruhan",
      "position": "center",
      "labelLayout": "stacked",
      "fontSize": 21,
      "fontWeight": "900",
      "color": "#1a1a1a",
      "exampleValue": "Rp 1.002.500",
      "hasBorder": true
    },
    {
      "id": "18",
      "type": "separator",
      "style": "dash",
      "color": "#333333"
    }
  ];