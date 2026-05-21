export type ElementType = 'input_text' | 'input_image' | 'text' | 'separator';
export type DataType = 'String' | 'Number' | 'Date' | 'Time' | 'Currency' | 'Hidden' | 'random_text' | 'random_number' | 'random_mixed' | 'Admin_Fee' | 'Store_Name' | 'total_keseluruhan' | 'Nominal' | 'Referensi' | 'Alamat_Toko';
export type Alignment = 'left' | 'center' | 'right';
export type SeparatorType = 'dash' | 'line';
export type LabelLayout = 'inline' | 'stacked';
export type FontWeight = 'normal' | 'bold' | '900';
export interface InputTextConfig {
  id: string;
  type: 'input_text';
  label: string;
  dataType: string;
  position: string;
  fontSize: number;
  color: string;
}