// src/utils/storagePaths.ts

export class StoragePaths {
  /** Avatars */
  static avatar(userId: string, fileName = "avatar.jpg") {
    return `avatars/${userId}/${fileName}`;
  }

  /** Inspiration images */
  static inspirationImage(appointmentId: string, fileName: string) {
    return `inspiration-images/${appointmentId}/${fileName}`;
  }

  /** Result photos */
  static resultPhoto(appointmentId: string, fileName: string) {
    return `result-photos/${appointmentId}/${fileName}`;
  }

  /** Service gallery (category: polygel | nail-art | seasonal) */
  static serviceGallery(category: "polygel" | "nail-art" | "seasonal", fileName: string) {
    return `service-gallery/${category}/${fileName}`;
  }

  /** Product images (category: polygel | gel-polish | decorations) */
  static productImage(category: "polygel" | "gel-polish" | "decorations", fileName: string) {
    return `product-images/${category}/${fileName}`;
  }

  /** Documents → Invoices */
  static invoice(year: number, month: string, fileName: string) {
    return `documents/invoices/${year}/${month}/${fileName}`;
  }

  /** Documents → Receipts */
  static receipt(clientId: string, invoiceNumber: string) {
    return `documents/receipts/${clientId}/receipt_${invoiceNumber}.pdf`;
  }

  /** Documents → Certificates */
  static certificate(fileName: "business_license.pdf" | "training_certificates.pdf") {
    return `documents/certificates/${fileName}`;
  }

  /** System assets */
  static systemAsset(path: "logos/main_logo.png" | "logos/favicon.ico" |
                              "templates/invoice_template.html" | "templates/email_signature.html" |
                              "marketing/social_media_templates" | "marketing/price_list.pdf") {
    return `system-assets/${path}`;
  }

  /** Backups → Database */
  static dbBackup(date: string, fileName = "full_backup.sql") {
    return `backups/database/${date}/${fileName}`;
  }

  /** Backups → Files */
  static fileBackup(date: string, fileName = "media_backup.zip") {
    return `backups/files/${date}/${fileName}`;
  }

  /** Backups → Exports */
  static exportFile(fileName: string) {
    return `backups/exports/${fileName}`;
  }
}
