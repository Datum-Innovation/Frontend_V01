import { ElementRef, Injectable, QueryList, ViewChildren } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EndpointConstant } from '../constants/endpoint.constant';
import { BaseService } from './base.service';
import { Subject, takeUntil } from 'rxjs';

import * as QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
@Injectable({
  providedIn: 'root'
})

export class PdfGenerationService {

  destroySubscription: Subject<void> = new Subject<void>();
  base64String: string = '';
  accid!: number;



  currentRowIndex: number = 0;  // Index of the currently focused row
  currentColIndex: number = 0;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  selectedIndex: number = -1;

  tableDetails: any = [];
  constructor(
    private httpClient: HttpClient,
    private baseservice: BaseService
  ) { }

  //80 mm
  //  generatePdf(transactionId:number,pageId:any,action:any,isMobile:any=false,isTab:any=false): void{
  //     // Fetch purchase details
  //     console.log("test sales id in print" + transactionId);
  //     this.baseservice
  //       .get(EndpointConstant.FILLPURCHASEBYID + transactionId + '&pageId=' + pageId)
  //       .pipe()
  //       .subscribe({
  //         next: async (response: any) => {
  //           const data = response?.data;

  //           if (!data) {
  //             console.error('No data found in the response.');
  //             return;
  //           }

  //           console.log("data:", JSON.stringify(data, null, 2));

  //           this.base64String = data.transaction?.fillTransactions?.invoiceQr ?? null;
  //           this.accid = data.transaction.fillTransactions.accountID;
  //           const tranid = data.transaction.fillTransactions.transactionNo;

  //           console.log("ACCID:" + this.accid);

  //           // Try to generate QR code
  //           try {
  //             const qrCodeCanvas = document.createElement('canvas');
  //             const qrValue = this.base64String
  //               ? this.base64String
  //               : JSON.stringify({
  //                 invoiceNo: data.transaction.fillTransactions.transactionNo,
  //                 date: data.transaction.fillTransactions.date,
  //                 customer: data.transaction.fillTransactions.accountName,
  //                 total: data.transaction.fillInvTransItems.reduce(
  //                   (sum: number, item: any) => sum + item.totalAmount,
  //                   0
  //                 ),
  //               });

  //             await QRCode.toCanvas(qrCodeCanvas, qrValue, {
  //               errorCorrectionLevel: 'M',
  //               margin: 2,
  //               width: 100, // Smaller QR code size
  //               color: {
  //                 dark: '#000000',
  //                 light: '#ffffff'
  //               }
  //             });

  //             const qrCodeDataURL = qrCodeCanvas.toDataURL('image/png');

  //             // Calculate totals
  //             const amount = data.transaction.fillInvTransItems.reduce(
  //               (sum: number, item: any) => sum + item.amount, 0);
  //             const tax = data.transaction.fillInvTransItems.reduce(
  //               (sum: number, item: any) => sum + item.taxValue, 0);
  //             const total = data.transaction.fillInvTransItems.reduce(
  //               (sum: number, item: any) => sum + item.totalAmount, 0);

  //             // Fetch party balance details
  //             this.baseservice.get(EndpointConstant.FILLPARTYBALANCE + this.accid)
  //               .pipe()
  //               .subscribe({
  //                 next: (response: any) => {
  //                   const balanceData = response?.data[0]?.stock;

  //                   // Dynamically create the print content
  //                   const printContent = `
  //                     <!DOCTYPE html>
  //                     <html lang="en-SA" dir="ltr">
  //                     <head>
  //                       <meta charset="UTF-8">
  //                       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //                       <title>SASTC Receipt</title>
  //                       <style>
  //                         @media print {
  //                           body {
  //                             width: 80mm;
  //                             margin: 0;
  //                             padding: 0;
  //                             text-align: center;
  //                           }
  //                           @page {
  //                             margin: 0;
  //                             size: 110mm auto;
  //                           }
  //                         }
  //                         body {
  //                           font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  //                           max-width: 80mm;
  //                           margin: 0 auto;
  //                           padding: 5mm;
  //                           background: white;
  //                           font-size: 18px;
  //                           line-height: 1.5;
  //                           text-align: center; 
  //                         }
  //                         .logo {
  //                           text-align: center;
  //                           margin-bottom: 5mm;
  //                         }
  //                         .logo img {
  //                           max-width: 45mm;
  //                           height: auto;
  //                           margin: 2mm auto;
  //                         }
  //                         .company-name {
  //                           text-align: center;
  //                           margin-bottom: 3mm;
  //                         }
  //                         .header-info, .invoice-details, .totals, .footer {
  //                           text-align: center;
  //                           font-size: 14px;
  //                           margin-bottom: 5mm;
  //                         }
  //                         .items-table {

  //                           border-collapse: collapse;
  //                           margin: 5mm 0;
  //                           font-size: 14px;
  //                           margin: 0 auto;
  //                         }

  //                         .items-table-container {
  //                         border-top: 1px dotted #000; 
  //                         margin-top: 5mm;
  //                         }

  //                         .items-table th {
  //                        font-weight: bold;
  //                        padding: 1mm ;
  //                         }



  //                         .totals {
  //                           border-top: 1px solid #000;
  //                           padding-top: 3mm;
  //                           margin-top: 3mm;
  //                           font-size: 16px;
  //                         }
  //                         .footer {
  //                           text-align: center;
  //                           font-size: 12px;
  //                           margin-top: 6mm;
  //                           border-top: 1px dashed #000;
  //                           padding-top: 3mm;
  //                         }



  //                       </style>
  //                     </head>
  //                     <body>
  //                       <div class="logo">
  //                         <img src="/assets/SASTC.png">
  //                       </div>
  //                       <div class="company-name">
  //                         <div>شركة صالح التجارية ذ.م.م</div>
  //                         <div>Saleh Trading Company L.L.C</div>
  //                       </div>
  //                       <div class="header-info">
  //                         Al-Adama - 15th St, Dammam P.O. Box 60793<br>
  //                         CR NO. 2550074943 VAT NO. 311547462100003
  //                       </div>
  //                       <div class="invoice-details">
  //                         VAT INVOICE<br>
  //                         Date: ${new Date(data.transaction.fillTransactions.date).toLocaleString()}<br>
  //                         Invoice No: ${data.transaction.fillTransactions.transactionNo}<br>
  //                         Customer: ${data.transaction.fillTransactions.accountName}<br>
  //                         Customer Vat No: ${data.transaction.fillTransactions.vatNo || "Not Available"}
  //                       </div>
  //                       <div class="items-table-container">
  //                       <table class="items-table" width="100%">
  //                         <thead>
  //                           <tr>
  //                             <th >SI</th>
  //                             <th >ITEM</th>
  //                             <th >QTY</th>
  //                             <th >PRICE</th>
  //                             <th >AMT</th>
  //                           </tr>
  //                         </thead>
  //                         <tbody>
  //                           ${data.transaction.fillInvTransItems.map((item: any, index: number) => `
  //                             <tr>
  //                               <td>${index + 1}</td>
  //                               <td >${item.itemName || item.arabicName}</td>
  //                               <td>${item.qty} (${item.unit || item.unitArabic})</td>
  //                               <td>${item.rate}</td>
  //                               <td>${item.amount}</td>
  //                             </tr>
  //                           `).join('')}
  //                         </tbody>
  //                       </table>
  //                       </div>
  //                       <div class="totals">
  //                         Total Excl VAT: ${amount}<br>
  //                         Total Vat Amount: ${tax}<br>
  //                         Total Incl Vat: ${total}<br>
  //                         Party Balance: ${balanceData || "N/A"}
  //                       </div>
  //                       <!-- QR Code Section -->
  //                       <div style="text-align: center; margin: 10px auto; padding: 10px;">
  //                         <img src="${qrCodeDataURL}" alt="QR Code" style="width: 250px; height: 250px; display: block; margin: 0 auto;">
  //                       </div>
  //                       <div class="footer">
  //                         THANK YOU FOR YOUR CUSTOMERSHIP AND THANKS FOR CHOOSING US<br>
  //                         THIS IS A COMPUTER GENERATED INVOICE SO NO SIGNATURE REQUIRED
  //                       </div>
  //                     </body>
  //                     </html>
  //                   `;

  //                   // Check if device is mobile or tablet
  //                   if (isMobile || isTab) {
  //                     // For mobile/tablet, generate PDF
  //                     const iframe = document.createElement('iframe');
  //                     iframe.style.position = 'absolute';
  //                     iframe.style.top = '-10000px';
  //                     document.body.appendChild(iframe);
  //                     const iframeDoc = iframe.contentWindow?.document;
  //                     iframeDoc?.open();
  //                     iframeDoc?.write(printContent);
  //                     iframeDoc?.close();

  //                     // Wait for the iframe to load completely before generating the PDF
  //                     iframe.onload = () => {
  //                       html2canvas(iframe.contentWindow?.document.body as HTMLElement).then(canvas => {
  //                         const pdf = new jsPDF('p', 'mm', [80, 297]);  // 80mm width x 297mm height (receipt size)

  //                         const imgWidth = 80;  // 80mm width (receipt paper)
  //                         const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //                         // Add image to PDF with proper scaling
  //                         const contentDataURL = canvas.toDataURL('image/png');
  //                         pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);

  //                         // Save PDF
  //                         pdf.save(`Trans.No-${tranid}.pdf`);
  //                       });
  //                     };
  //                   } else {
  //                     console.log("DESKTOP/LAP")
  //                     // For desktop/laptop, use iframe to print
  //                     const iframe = document.createElement('iframe');
  //                     iframe.style.position = 'absolute';
  //                     iframe.style.top = '-10000px';
  //                     document.body.appendChild(iframe);

  //                     const iframeDoc = iframe.contentWindow?.document;
  //                     if (iframeDoc) {
  //                       iframeDoc.open();
  //                       iframeDoc.write(printContent);
  //                       iframeDoc.close();

  //                       // Wait for the iframe to load completely before printing
  //                       setTimeout(() => {
  //                         iframe.contentWindow?.focus();
  //                         iframe.contentWindow?.print();

  //                         // Clean up after printing
  //                         setTimeout(() => {
  //                           document.body.removeChild(iframe);
  //                         }, 1000);
  //                       }, 500); // Give enough time for the QR code to render
  //                     }
  //                   }
  //                 },
  //                 error: (error: any) => {
  //                   console.error('Error fetching party balance:', error);
  //                 }
  //               });
  //           } catch (error) {
  //             console.error('Error generating QR code:', error);
  //           }
  //         },
  //         error: (error: any) => {
  //           console.error('Error fetching purchase details:', error);
  //         }
  //       });
  //   }

  // generatePdf(transactionId:number,pageId:any,action:any,isMobile:any=false,isTab:any=false,address:any): void{
  //   // Fetch purchase details
  //   console.log("test sales id in print" + transactionId);
  //   this.baseservice
  //     .get(EndpointConstant.FILLPURCHASEBYID + transactionId + '&pageId=' + pageId)
  //     .pipe()
  //     .subscribe({
  //       next: async (response: any) => {
  //         const data = response?.data;
  
  //         if (!data) {
  //           console.error('No data found in the response.');
  //           return;
  //         }
  
  //         console.log("data:", JSON.stringify(data, null, 2));
  
  //         this.base64String = data.transaction?.fillTransactions?.invoiceQr ?? null;
  //         this.accid = data.transaction.fillTransactions.accountID;
  //         const tranid = data.transaction.fillTransactions.transactionNo;
  
  //         console.log("ACCID:" + this.accid);
  
  //         // Try to generate QR code
  //         try {
  //           const qrCodeCanvas = document.createElement('canvas');
  //           const qrValue = this.base64String
  //             ? this.base64String
  //             : JSON.stringify({
  //               invoiceNo: data.transaction.fillTransactions.transactionNo,
  //               date: data.transaction.fillTransactions.date,
  //               customer: data.transaction.fillTransactions.accountName,
  //               total: data.transaction.fillInvTransItems.reduce(
  //                 (sum: number, item: any) => sum + item.totalAmount,
  //                 0
  //               ),
  //             });
  
  //           await QRCode.toCanvas(qrCodeCanvas, qrValue, {
  //             errorCorrectionLevel: 'M',
  //             margin: 2,
  //             width: 100, // Smaller QR code size
  //             color: {
  //               dark: '#000000',
  //               light: '#ffffff'
  //             }
  //           });
  
  //           const qrCodeDataURL = qrCodeCanvas.toDataURL('image/png');
  
  //           // Calculate totals
  //           const amount = data.transaction.fillInvTransItems.reduce(
  //             (sum: number, item: any) => sum + item.amount, 0);
  //           const tax = data.transaction.fillInvTransItems.reduce(
  //             (sum: number, item: any) => sum + item.taxValue, 0);
  //           const total = data.transaction.fillInvTransItems.reduce(
  //             (sum: number, item: any) => sum + item.totalAmount, 0);
  
  //           // Fetch party balance details
  //           this.baseservice.get(EndpointConstant.FILLPARTYBALANCE + this.accid)
  //             .pipe()
  //             .subscribe({
  //               next: (response: any) => {
  //                 const balanceData = response?.data[0]?.stock;
  
  //                 // Dynamically create the print content
  //                 const printContent = `
  //                   <!DOCTYPE html>
  //                   <html lang="en-SA" dir="ltr">
  //                   <head>
  //                     <meta charset="UTF-8">
  //                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //                     <title>Dibaj World Invoice</title>
  //                     <style>
  //                       @media print {
  //                         @page {
  //                           size: A4;
  //                           margin: 0;
  //                         }
  //                       }
  //                       body {
  //                         font-family: Arial, sans-serif;
  //                         margin: 0;
  //                         padding: 0;
  //                         font-size: 12px;
  //                         max-width: 210mm;
  //                         min-height: 297mm;
  //                         box-sizing: border-box;
  //                         position: relative;
  //                       }
  //                       .page {
  //                         position: relative;
  //                         padding: 25px;
  //                         margin: 0;
  //                         page-break-after: always;
  //                         min-height: 257mm;
  //                         box-sizing: border-box;
  //                       }
  //                       .page:last-child {
  //                         page-break-after: avoid;
  //                       }
  //                       .header {
  //                         width: 100%;
  //                         padding: 0;
  //                         margin-bottom: 30px;
  //                         text-align: center;
  //                       }
  //                       .header-logo {
  //                         width: 100%;
  //                         max-width: 700px;
  //                         height: auto;
  //                         display: block;
  //                         margin: 0 auto;
  //                       }
  //                       .info-container {
  //                         display: flex;
  //                         justify-content: space-between;
  //                         margin-bottom: 25px;
  //                       }
  //                       .customer-info, .invoice-info {
  //                         border: 1px solid #000;
  //                         padding: 10px;
  //                         width: 45%;
  //                       }
  //                       .items-table {
  //                         width: 100%;
  //                         border-collapse: collapse;
  //                         margin: 25px 0;
  //                       }
  //                       .items-table th, .items-table td {
  //                         border: 1px solid #000;
  //                         padding: 6px;
  //                         text-align: center;
  //                         font-size: 11px;
  //                       }
  //                       .items-table th {
  //                         background-color: #ffffff;
  //                       }
  //                       .footer {
  //                         position: fixed;
  //                         bottom: 0;
  //                         left: 0;
  //                         right: 0;
  //                         width: 100%;
  //                         text-align: center;
  //                       }
  //                       .footer-logo {
  //                         width: 100%;
  //                         max-width: 700px;
  //                         height: auto;
  //                         display: block;
  //                         margin: 0 auto;
  //                       }
  //                       .page-number {
  //                         text-align: right;
  //                         margin-bottom: 10px;
  //                         font-size: 10px;
  //                         padding-right: 25px;
  //                       }
  //                       .totals-section {
  //                         width: 300px;
  //                         margin-left: auto;
  //                         margin-bottom: 30px;
  //                       }
  //                       .totals-table {
  //                         width: 100%;
  //                         border-collapse: collapse;
  //                       }
  //                       .totals-table td {
  //                         border: 1px solid #000;
  //                         padding: 4px 8px;
  //                         text-align: right;
  //                       }
  //                       .totals-table td:first-child {
  //                         text-align: left;
  //                       }
  //                       .signatures {
  //                         display: flex;
  //                         justify-content: space-around;
  //                         margin: 30px 50px;
  //                       }
  //                       .signature {
  //                         text-align: center;
  //                         border-top: 1px solid #000;
  //                         width: 150px;
  //                         padding-top: 5px;
  //                       }
  //                       .qr-code {
  //                         text-align: center;
  //                         margin: 25px 0;
  //                       }
  //                       .qr-code img {
  //                         width: 100px;
  //                         height: 100px;
  //                       }
  //                     </style>
  //                   </head>
  //                   <body>
  //                     ${Array.from({ length: Math.ceil(data.transaction.fillInvTransItems.length / 25) }, (_, pageIndex) => `
  //                       <div class="page">
  //                         <!-- Header (on all pages) -->
  //                         <div class="header">
  //                           <img src="/assets/dibaj-logo.png" alt="Dibaj World Logo" class="header-logo">
  //                         </div>
  
  //                         ${pageIndex === 0 ? `
  //                           <!-- Customer Info Section (only on first page) -->
  //                           <div class="info-container">
  //                             <div cass="customer-info">
  //                               <div>Customer Code: ${data.transaction.fillTransactions.accountCode || ''}</div>
  //                               <div>Customer Name: ${data.transaction.fillTransactions.accountName || ''}</div>
  //                                <div>Customer Address: ${address || ''}</div>
  //                               <div>VAT No: ${data.transaction.fillAdditionals.vatNo || ''}</div>
  //                             </div>
  //                             <div class="invoice-info">
  //                               <div style="text-align: center; margin-bottom: 10px;">
  //                                 <strong>VAT Invoice</strong><br>
                                  
  //                                 <span style="font-family: Arial;">فاتورة ضريبية</span>
  //                               </div>
  //                               <table class="invoice-details" style="width: 100%;">
  //                                 <tr>
  //                                   <th>Inv. Date</th>
  //                                   <th>Inv. No.</th>
  //                                   <th>Payment Type</th>
  //                                   <th>Due Date</th>
  //                                 </tr>
  //                                 <tr>
  //                                   <td>${new Date(data.transaction.fillTransactions.date).toLocaleDateString()}</td>
  //                                   <td>${data.transaction.fillTransactions.transactionNo}</td>
  //                                   <td>${data.transaction.fillTransactions.paymentType || 'CREDIT'}</td>
  //                                   <td>${data.transaction.fillTransactions.dueDate || '26-Sep-2524'}</td>
  //                                 </tr>
  //                               </table>
  //                             </div>
  //                           </div>
  //                         ` : ''}
  
  //                         <!-- Items Table (on all pages) -->
  //                         <table class="items-table">
  //                           <thead>
  //                             <tr>
  //                               <th>SI No</th>
  //                               <th>Item Code</th>
  //                               <th>Description</th>
  //                               <th>Qty</th>
  //                               <th>Unit</th>
  //                               <th>U/PRICE</th>
  //                               <th>DISC</th>
  //                               <th>NET Amt.</th>
  //                               <th>VAT VALUE</th>
  //                               <th>TOTAL</th>
  //                             </tr>
  //                           </thead>
  //                           <tbody>
  //                             ${data.transaction.fillInvTransItems
  //                               .slice(pageIndex * 25, (pageIndex + 1) * 25)
  //                               .map((item: any, index: number) => `
  //                                 <tr>
  //                                   <td>${pageIndex * 25 + index + 1}</td>
  //                                   <td>${item.itemCode || '-'}</td>
  //                                   <td style="text-align: left">${item.itemName || item.arabicName}</td>
  //                                   <td>${item.qty}</td>
  //                                   <td>${item.unit || 'CTN'}</td>
  //                                   <td>${item.rate?.toFixed(2)}</td>
  //                                   <td>${item.discount || '0'}</td>
  //                                   <td>${item.amount?.toFixed(2)}</td>
  //                                   <td>${item.taxValue?.toFixed(2)}</td>
  //                                   <td>${item.totalAmount?.toFixed(2)}</td>
  //                                 </tr>
  //                               `).join('')}
  //                           </tbody>
  //                         </table>
  
  //                         ${pageIndex === Math.ceil(data.transaction.fillInvTransItems.length / 25) - 1 ? `
  //                           <!-- Totals Section (only on last page) -->
  //                           <div class="totals-section">
  //                             <table class="totals-table">
  //                               <tr>
  //                                 <td style="width: 200px;">Total without tax</td>
  //                                 <td style="width: 150px; text-align: right;">الإجمالي بدون ضريبة</td>
  //                                 <td style="width: 100px; text-align: right;">${amount?.toFixed(2)}</td>
  //                               </tr>
  //                               <tr>
  //                                 <td>Discount</td>
  //                                 <td style="text-align: right;">الخصم</td>
  //                                 <td style="text-align: right;">${(data.transaction.fillTransactions.discount || 0).toFixed(2)}</td>
  //                               </tr>
  //                               <tr>
  //                                 <td>Total Before Vat</td>
  //                                 <td style="text-align: right;">الإجمالي قبل القيمة المضافة</td>
  //                                 <td style="text-align: right;">${(amount - (data.transaction.fillTransactions.discount || 0)).toFixed(2)}</td>
  //                               </tr>
  //                               <tr>
  //                                 <td>15% VAT</td>
  //                                 <td style="text-align: right;">القيمة المضافة</td>
  //                                 <td style="text-align: right;">${tax?.toFixed(2)}</td>
  //                               </tr>
  //                               <tr>
  //                                 <td>Extra Discount</td>
  //                                 <td style="text-align: right;">خصم اضافي</td>
  //                                 <td style="text-align: right;">0.00</td>
  //                               </tr>
  //                               <tr>
  //                                 <td>Net Amount</td>
  //                                 <td style="text-align: right;">المبلغ الصافي</td>
  //                                 <td style="text-align: right;">${total?.toFixed(2)}</td>
  //                               </tr>
  //                             </table>
  //                           </div>
  
  //                           <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
  //                             <div style="flex: 1; padding: 10px; border: 1px solid #000; margin-right: 20px;">
  //                               <div style="text-align: left; margin-bottom: 5px;">
  //                                 ${this.numberToWords(Math.floor(total))} Riyals and ${Math.round((total % 1) * 100)} Halalas Only
  //                               </div>
  //                               <div style="text-align: right; font-family: Arial;">
  //                                 ${this.numberToArabicWords(Math.floor(total))} ريال و ${Math.round((total % 1) * 100)} هللة فقط
  //                               </div>
  //                             </div>
  //                             <div style="width: 150px;">
  //                               <div class="qr-code">
  //                                 <img src="${qrCodeDataURL}" alt="QR Code" style="width: 150px; height: 150px;">
  //                               </div>
  //                             </div>
  //                           </div>
  
  //                           <div class="signatures" style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
  //                             <div class="signature">
  //                               <div>User</div>
  //                               <div>SALESMAN</div>
  //                             </div>
  //                             <div class="signature">
  //                               <div>ACCOUNTANT</div>
  //                             </div>
  //                             <div class="signature">
  //                               <div>CUSTOMER</div>
  //                             </div>
  //                           </div>
  
                          
  //                         ` : ''}
  
                          
  //                         <div class="footer">
  //                           <img src="/assets/dibaj-footer.png" alt="Dibaj World Footer" class="footer-logo">
  //                         </div>
  //                       </div>
  //                     `).join('')}
  //                   </body>
  //                   </html>
  //                 `;
  
  //                 // Check if device is mobile or tablet
  //                 if (isMobile || isTab) {
  //                   const iframe = document.createElement('iframe');
  //                   iframe.style.position = 'absolute';
  //                   iframe.style.top = '-10000px';
  //                   iframe.style.width = '210mm';
  //                   iframe.style.height = '297mm';
  //                   document.body.appendChild(iframe);
                    
  //                   const iframeDoc = iframe.contentWindow?.document;
  //                   iframeDoc?.open();
  //                   iframeDoc?.write(printContent);
  //                   iframeDoc?.close();
          
  //                   iframe.onload = () => {
  //                     html2canvas(iframe.contentWindow?.document.body as HTMLElement, {
  //                       scale: 3,
  //                       useCORS: true,
  //                       allowTaint: true,
  //                       width: 210 * 3.78, // A4 width in pixels (210mm * 3.78 pixels/mm)
  //                       height: 297 * 3.78, // A4 height in pixels (297mm * 3.78 pixels/mm)
  //                       windowWidth: 210 * 3.78,
  //                       windowHeight: 297 * 3.78,
  //                       logging: true,
  //                       backgroundColor: '#ffffff'
  //                     }).then(canvas => {
  //                       const pdf = new jsPDF({
  //                         orientation: 'portrait',
  //                         unit: 'mm',
  //                         format: 'a4',
  //                         compress: true
  //                       });
          
  //                       const imgData = canvas.toDataURL('image/jpeg', 1.0);
  //                       pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, '', 'FAST');
  
  //                       pdf.save(`salesinvoice-${data.transaction.fillTransactions.transactionNo}.pdf`);
                        
  //                       // Clean up
  //                       document.body.removeChild(iframe);
  //                     });
  //                   };
  //                 } else {
  //                   console.log("DESKTOP/LAP")
  //                   // For desktop/laptop, use iframe to print
  //                   const iframe = document.createElement('iframe');
  //                   iframe.style.position = 'absolute';
  //                   iframe.style.top = '-10000px';
  //                   document.body.appendChild(iframe);
  
  //                   const iframeDoc = iframe.contentWindow?.document;
  //                   if (iframeDoc) {
  //                     iframeDoc.open();
  //                     iframeDoc.write(printContent);
  //                     iframeDoc.close();
  
  //                     // Wait for the iframe to load completely before printing
  //                     setTimeout(() => {
  //                       iframe.contentWindow?.focus();
  //                       iframe.contentWindow?.print();
  
  //                       // Clean up after printing
  //                       setTimeout(() => {
  //                         document.body.removeChild(iframe);
  //                       }, 1000);
  //                     }, 500); // Give enough time for the QR code to render
  //                   }
  //                 }
  //               },
  //               error: (error: any) => {
  //                 console.error('Error fetching party balance:', error);
  //               }
  //             });
  //         } catch (error) {
  //           console.error('Error generating QR code:', error);
  //         }
  //       },
  //       error: (error: any) => {
  //         console.error('Error fetching purchase details:', error);
  //       }
  //     });
  // }
  generatePdf(transactionId: number, pageId: any, action: any, isMobile: any = false, isTab: any = false, address: any): void {
    console.log("test sales id in print" + transactionId);
    this.baseservice
      .get(EndpointConstant.FILLPURCHASEBYID + transactionId + '&pageId=' + pageId)
      .pipe()
      .subscribe({
        next: async (response: any) => {
          const data = response?.data;
          if (!data) {
            console.error('No data found in the response.');
            return;
          }
  
          this.base64String = data.transaction?.fillTransactions?.invoiceQr ?? null;
          this.accid = data.transaction.fillTransactions.accountID;
          const tranid = data.transaction.fillTransactions.transactionNo;
  
          let qrCodeDataURL = '';
  
          try {
            const qrCodeCanvas = document.createElement('canvas');
            const qrValue = this.base64String
              ? this.base64String
              : JSON.stringify({
                invoiceNo: tranid,
                date: data.transaction.fillTransactions.date,
                customer: data.transaction.fillTransactions.accountName,
                total: data.transaction.fillInvTransItems.reduce((sum: number, item: any) => sum + item.totalAmount, 0),
              });
  
            await QRCode.toCanvas(qrCodeCanvas, qrValue, {
              errorCorrectionLevel: 'M',
              margin: 2,
              width: 100,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            });
            qrCodeDataURL = qrCodeCanvas.toDataURL('image/png');
          } catch (error) {
            console.error('QR Code generation failed:', error);
          }
  
          const amount = data.transaction.fillInvTransItems.reduce((sum: number, item: any) => sum + item.amount, 0);
          const tax = data.transaction.fillInvTransItems.reduce((sum: number, item: any) => sum + item.taxValue, 0);
          const total = data.transaction.fillInvTransItems.reduce((sum: number, item: any) => sum + item.totalAmount, 0);
  
          this.baseservice.get(EndpointConstant.FILLPARTYBALANCE + this.accid)
            .pipe()
            .subscribe({
              next: (balanceResp: any) => {
                const balanceData = balanceResp?.data?.[0]?.stock;
  
                // Inject your HTML content generation logic here (use your existing HTML string)
                const printContent = `
                    <!DOCTYPE html>
                    <html lang="en-SA" dir="ltr">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Dibaj World Invoice</title>
                      <style>
                        @media print {
                          @page {
                            size: A4;
                            margin: 0;
                          }
                        }
                        body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 0;
                          font-size: 12px;
                          max-width: 210mm;
                          min-height: 297mm;
                          box-sizing: border-box;
                          position: relative;
                        }
                        .page {
                          position: relative;
                          padding: 25px;
                          margin: 0;
                          page-break-after: always;
                          min-height: 257mm;
                          box-sizing: border-box;
                        }
                        .page:last-child {
                          page-break-after: avoid;
                        }
                        .header {
                          width: 100%;
                          padding: 0;
                          margin-bottom: 30px;
                          text-align: center;
                        }
                        .header-logo {
                          width: 100%;
                          max-width: 700px;
                          height: auto;
                          display: block;
                          margin: 0 auto;
                        }
                        .info-container {
                          display: flex;
                          justify-content: space-between;
                          margin-bottom: 25px;
                        }
                        .customer-info, .invoice-info {
                          border: 1px solid #000;
                          padding: 10px;
                          width: 45%;
                        }
                        .items-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 25px 0;
                        }
                        .items-table th, .items-table td {
                          border: 1px solid #000;
                          padding: 6px;
                          text-align: center;
                          font-size: 11px;
                        }
                        .items-table th {
                          background-color: #ffffff;
                        }
                        .footer {
                          position: fixed;
                          bottom: 0;
                          left: 0;
                          right: 0;
                          width: 100%;
                          text-align: center;
                        }
                        .footer-logo {
                          width: 100%;
                          max-width: 700px;
                          height: auto;
                          display: block;
                          margin: 0 auto;
                        }
                        .page-number {
                          text-align: right;
                          margin-bottom: 10px;
                          font-size: 10px;
                          padding-right: 25px;
                        }
                        .totals-section {
                          width: 300px;
                          margin-left: auto;
                          margin-bottom: 30px;
                        }
                        .totals-table {
                          width: 100%;
                          border-collapse: collapse;
                        }
                        .totals-table td {
                          border: 1px solid #000;
                          padding: 4px 8px;
                          text-align: right;
                        }
                        .totals-table td:first-child {
                          text-align: left;
                        }
                        .signatures {
                          display: flex;
                          justify-content: space-around;
                          margin: 30px 50px;
                        }
                        .signature {
                          text-align: center;
                          border-top: 1px solid #000;
                          width: 150px;
                          padding-top: 5px;
                        }
                        .qr-code {
                          text-align: center;
                          margin: 25px 0;
                        }
                        .qr-code img {
                          width: 100px;
                          height: 100px;
                        }
                      </style>
                    </head>
                    <body>
                      ${Array.from({ length: Math.ceil(data.transaction.fillInvTransItems.length / 25) }, (_, pageIndex) => `
                        <div class="page">
                          <!-- Header (on all pages) -->
                          <div class="header">
                            <img src="/assets/dibaj-logo.png" alt="Dibaj World Logo" class="header-logo">
                          </div>
  
                          ${pageIndex === 0 ? `
                            <!-- Customer Info Section (only on first page) -->
                            <div class="info-container">
                              <div cass="customer-info">
                                <div>Customer Code: ${data.transaction.fillTransactions.accountCode || ''}</div>
                                <div>Customer Name: ${data.transaction.fillTransactions.accountName || ''}</div>
                                 <div>Customer Address: ${address || ''}</div>
                                <div>VAT No: ${data.transaction.fillAdditionals.vatNo || ''}</div>
                              </div>
                              <div class="invoice-info">
                                <div style="text-align: center; margin-bottom: 10px;">
                                  <strong>VAT Invoice</strong><br>
                                  
                                  <span style="font-family: Arial;">فاتورة ضريبية</span>
                                </div>
                                <table class="invoice-details" style="width: 100%;">
                                  <tr>
                                    <th>Inv. Date</th>
                                    <th>Inv. No.</th>
                                    <th>Payment Type</th>
                                    <th>Due Date</th>
                                  </tr>
                                  <tr>
                                    <td>${new Date(data.transaction.fillTransactions.date).toLocaleDateString()}</td>
                                    <td>${data.transaction.fillTransactions.transactionNo}</td>
                                    <td>${data.transaction.fillTransactions.paymentType || 'CREDIT'}</td>
                                    <td>${data.transaction.fillTransactions.dueDate || '26-Sep-2524'}</td>
                                  </tr>
                                </table>
                              </div>
                            </div>
                          ` : ''}
  
                          <!-- Items Table (on all pages) -->
                          <table class="items-table">
                            <thead>
                              <tr>
                                <th>SI No</th>
                                <th>Item Code</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Unit</th>
                                <th>U/PRICE</th>
                                <th>DISC</th>
                                <th>NET Amt.</th>
                                <th>VAT VALUE</th>
                                <th>TOTAL</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${data.transaction.fillInvTransItems
                                .slice(pageIndex * 25, (pageIndex + 1) * 25)
                                .map((item: any, index: number) => `
                                  <tr>
                                    <td>${pageIndex * 25 + index + 1}</td>
                                    <td>${item.itemCode || '-'}</td>
                                    <td style="text-align: left">${item.itemName || item.arabicName}</td>
                                    <td>${item.qty}</td>
                                    <td>${item.unit || 'CTN'}</td>
                                    <td>${item.rate?.toFixed(2)}</td>
                                    <td>${item.discount || '0'}</td>
                                    <td>${item.amount?.toFixed(2)}</td>
                                    <td>${item.taxValue?.toFixed(2)}</td>
                                    <td>${item.totalAmount?.toFixed(2)}</td>
                                  </tr>
                                `).join('')}
                            </tbody>
                          </table>
  
                          ${pageIndex === Math.ceil(data.transaction.fillInvTransItems.length / 25) - 1 ? `
                            <!-- Totals Section (only on last page) -->
                            <div class="totals-section">
                              <table class="totals-table">
                                <tr>
                                  <td style="width: 200px;">Total without tax</td>
                                  <td style="width: 150px; text-align: right;">الإجمالي بدون ضريبة</td>
                                  <td style="width: 100px; text-align: right;">${amount?.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td>Discount</td>
                                  <td style="text-align: right;">الخصم</td>
                                  <td style="text-align: right;">${(data.transaction.fillTransactions.discount || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td>Total Before Vat</td>
                                  <td style="text-align: right;">الإجمالي قبل القيمة المضافة</td>
                                  <td style="text-align: right;">${(amount - (data.transaction.fillTransactions.discount || 0)).toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td>15% VAT</td>
                                  <td style="text-align: right;">القيمة المضافة</td>
                                  <td style="text-align: right;">${tax?.toFixed(2)}</td>
                                </tr>
                                <tr>
                                  <td>Extra Discount</td>
                                  <td style="text-align: right;">خصم اضافي</td>
                                  <td style="text-align: right;">0.00</td>
                                </tr>
                                <tr>
                                  <td>Net Amount</td>
                                  <td style="text-align: right;">المبلغ الصافي</td>
                                  <td style="text-align: right;">${total?.toFixed(2)}</td>
                                </tr>
                              </table>
                            </div>
  
                            <div style="display: flex; justify-content: space-between; align-items: center; margin: 20px 0;">
                              <div style="flex: 1; padding: 10px; border: 1px solid #000; margin-right: 20px;">
                                <div style="text-align: left; margin-bottom: 5px;">
                                  ${this.numberToWords(Math.floor(total))} Riyals and ${Math.round((total % 1) * 100)} Halalas Only
                                </div>
                                <div style="text-align: right; font-family: Arial;">
                                  ${this.numberToArabicWords(Math.floor(total))} ريال و ${Math.round((total % 1) * 100)} هللة فقط
                                </div>
                              </div>
                              <div style="width: 150px;">
                                <div class="qr-code">
                                  <img src="${qrCodeDataURL}" alt="QR Code" style="width: 150px; height: 150px;">
                                </div>
                              </div>
                            </div>
  
                            <div class="signatures" style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
                              <div class="signature">
                                <div>User</div>
                                <div>SALESMAN</div>
                              </div>
                              <div class="signature">
                                <div>ACCOUNTANT</div>
                              </div>
                              <div class="signature">
                                <div>CUSTOMER</div>
                              </div>
                            </div>
  
                          
                          ` : ''}
  
                          
                          <div class="footer">
                            <img src="/assets/dibaj-footer.png" alt="Dibaj World Footer" class="footer-logo">
                          </div>
                        </div>
                      `).join('')}
                    </body>
                    </html>
                  `;
  
                if (isMobile || isTab) {
                  const iframe = document.createElement('iframe');
                  iframe.style.position = 'absolute';
                  iframe.style.top = '-10000px';
                  iframe.style.width = '210mm';
                  iframe.style.height = '297mm';
                  document.body.appendChild(iframe);
  
                  const iframeDoc = iframe.contentWindow?.document;
                  iframeDoc?.open();
                  iframeDoc?.write(printContent);
                  iframeDoc?.close();
  
                  const renderAndDownloadPDF = () => {
                    setTimeout(() => {
                      const element = iframe.contentWindow?.document.body;
                      if (!element) {
                        console.error('Iframe content not found for canvas rendering.');
                        return;
                      }
  
                      const deviceMemory = (navigator as any).deviceMemory;
const scale = deviceMemory && deviceMemory < 2 ? 2 : 3;

                      html2canvas(element, {
                        scale,
                        useCORS: true,
                        allowTaint: false,
                        backgroundColor: '#ffffff'
                      }).then(canvas => {
                        const pdf = new jsPDF({
                          orientation: 'portrait',
                          unit: 'mm',
                          format: 'a4',
                          compress: true
                        });
  
                        const imgData = canvas.toDataURL('image/jpeg', 1.0);
                        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, '', 'FAST');
  
                        try {
                          // Try direct save
                          pdf.save(`salesinvoice-${tranid}.pdf`);
                        } catch {
                          // Fallback anchor download
                          const blob = pdf.output('blob');
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(blob);
                          link.download = `salesinvoice-${tranid}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
  
                        // Clean up
                        document.body.removeChild(iframe);
                      });
                    }, 1000); // Add a short delay for rendering
                  };
  
                  let iframeLoadTimeout = setTimeout(() => {
                    renderAndDownloadPDF();
                  }, 2000);
  
                  iframe.onload = () => {
                    clearTimeout(iframeLoadTimeout);
                    renderAndDownloadPDF();
                  };
  
                } else {
                  // Desktop: Print via iframe
                  const iframe = document.createElement('iframe');
                  iframe.style.position = 'absolute';
                  iframe.style.top = '-10000px';
                  document.body.appendChild(iframe);
  
                  const iframeDoc = iframe.contentWindow?.document;
                  if (iframeDoc) {
                    iframeDoc.open();
                    iframeDoc.write(printContent);
                    iframeDoc.close();
  
                    setTimeout(() => {
                      iframe.contentWindow?.focus();
                      iframe.contentWindow?.print();
  
                      setTimeout(() => {
                        document.body.removeChild(iframe);
                      }, 1000);
                    }, 500);
                  }
                }
              },
              error: (err) => {
                console.error('Error fetching party balance:', err);
              }
            });
        },
        error: (err: any) => {
          console.error('Error fetching purchase details:', err);
        }
      });
  }
  

  // Add this helper function to convert number to words
  private numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanOneThousand = (n: number): string => {
      if (n === 0) return '';

      if (n < 10) return ones[n];

      if (n < 20) return teens[n - 10];

      const digit = n % 10;
      if (n < 100) return tens[Math.floor(n / 10)] + (digit ? ' ' + ones[digit] : '');

      const hundred = Math.floor(n / 100);
      return ones[hundred] + ' Hundred' + (n % 100 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
    };

    if (num === 0) return 'Zero';

    const billion = Math.floor(num / 1000000000);
    const million = Math.floor((num % 1000000000) / 1000000);
    const thousand = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    let result = '';

    if (billion) result += convertLessThanOneThousand(billion) + ' Billion ';
    if (million) result += convertLessThanOneThousand(million) + ' Million ';
    if (thousand) result += convertLessThanOneThousand(thousand) + ' Thousand ';
    if (remainder) result += convertLessThanOneThousand(remainder);

    return result.trim();
  }

  // Add this helper function for Arabic number to words conversion
  private numberToArabicWords(num: number): string {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const thousands = ['', 'ألف', 'ألفان', 'آلاف', 'ألف'];

    const convertLessThanOneThousand = (n: number): string => {
      if (n === 0) return '';

      if (n < 10) return ones[n];

      if (n < 100) {
        const digit = n % 10;
        const ten = Math.floor(n / 10);
        return digit ? ones[digit] + ' و' + tens[ten] : tens[ten];
      }

      const hundred = Math.floor(n / 100);
      return hundreds[hundred] + (n % 100 ? ' و' + convertLessThanOneThousand(n % 100) : '');
    };

    if (num === 0) return 'صفر';

    let result = '';

    const billion = Math.floor(num / 1000000000);
    const million = Math.floor((num % 1000000000) / 1000000);
    const thousand = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    if (billion) result += convertLessThanOneThousand(billion) + ' مليار ';
    if (million) result += convertLessThanOneThousand(million) + ' مليون ';
    if (thousand) result += convertLessThanOneThousand(thousand) + ' ' + thousands[thousand > 10 ? 3 : thousand] + ' ';
    if (remainder) result += convertLessThanOneThousand(remainder);

    return result.trim();
  }

  generateReceiptVoucherPdf(transactionId: number, pageId: any, action: any, isMobile: any = false, isTab: any = false): void {
    this.baseservice
      .get(EndpointConstant.FILLPURCHASEBYID + transactionId + '&pageId=' + pageId)
      .pipe()
      .subscribe({
        next: async (response: any) => {
          const data = response?.data;
          if (!data) {
            console.error('No data found in the response.');
            return;
          }

          const transaction = data.transaction.fillTransactions;
          const entries = data.transaction.fillTransactionEntries;
          const creditEntry = entries.find((entry: any) => entry.drCr === 'C');
          const amount = creditEntry ? creditEntry.amount : 0;
          this.accid = data.transaction.fillTransactions.accountID;
          this.baseservice.get(EndpointConstant.FILLPARTYBALANCE + this.accid)
          .pipe()
          .subscribe({
            next: (response: any) => {
              const balanceData = response?.data[0]?.stock;
              const printContent = `
              <!DOCTYPE html>
              <html lang="en-SA" dir="ltr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Receipt Voucher</title>
                <style>
                  @media print {
                    @page {
                      size: A4;
                      margin: 0;
                    }
                  }
                  body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 15mm;
                    width: 210mm;
                    height: 148.5mm; /* Half of A4 height (297mm/2) */
                    position: relative;
                    box-sizing: border-box;
                    font-size: 11pt;
                    page-break-after: always;
                  }
                  .container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    padding: 0;
                    margin: 0;
                    padding-bottom: 40mm; /* Increased padding to prevent footer overlap */
                  }
                  .header-logo {
                    width: 100%;
                    max-width: 150mm;
                    height: auto;
                    display: block;
                    margin: 0 auto 5mm;
                  }
                  .content {
                    padding: 0;
                    margin-bottom: 30mm; /* Added margin to create space between content and footer */
                  }
                  .receipt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin: 5mm 0;
                  }
                  .receipt-title {
                    background: #e0e0e0;
                    padding: 2mm 5mm;
                    border-radius: 2mm;
                    text-align: center;
                    margin: 0 auto;
                    font-size: 12pt;
                  }
                  .amount-box {
                    display: flex;
                    gap: 2mm;
                    align-items: center;
                  }
                  .amount-box span {
                    border: 1px solid #000;
                    padding: 1mm 3mm;
                    min-width: 15mm;
                    text-align: center;
                  }
                  .form-row {
                    display: flex;
                    margin: 4mm 0;
                    position: relative;
                    align-items: center;
                    min-height: 6mm;
                  }
                  .form-label {
                    width: 40mm;
                    font-weight: normal;
                    font-size: 11pt;
                  }
                  .form-field {
                    flex: 1;
                    border-bottom: 1px dotted #000;
                    min-height: 5mm;
                    padding: 0 2mm;
                    font-size: 11pt;
                  }
                  .arabic-label {
                    position: absolute;
                    right: 0;
                    top: -4mm;
                    font-size: 9pt;
                  }
                  .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin: 15px 50px;
                    padding-bottom: 20mm; /* Increased padding below signatures */
                  }
                  .signature {
                    text-align: center;
                    width: 150px;
                  }
                  .signature-line {
                    border-top: 1px solid #000;
                    padding-top: 5px;
                  }
                  .footer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    text-align: center;
                    background: white;
                    padding: 5mm 0;
                    margin-top: 10mm; /* Added margin above footer */
                  }
                  .footer img {
                    width: 100%;
                    max-width: 150mm;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                  }
                  .content-wrapper {
                    position: relative;
                    margin-bottom: 20mm;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <!-- Header -->
                  <img src="/assets/dibaj-logo.png" alt="Header" class="header-logo">
                  
                  <div class="content">
                    <!-- Receipt Header -->
                    <div class="receipt-header">
                      <div style="display: flex; gap: 5mm; align-items: center;">
                        <div>No. Teal</div>
                        <div style="border-bottom: 1px dotted #000; min-width: 30mm; padding: 0 2mm;">
                          ${transaction.serialNo || ''}
                        </div>
                      </div>
                      <div class="receipt-title">
                        <div>سند قبض</div>
                        <div>Receipt Voucher</div>
                      </div>
                      <div class="amount-box">
                        <div>S.R.</div>
                        <span>${Math.floor(amount)}</span>
                        <div>H.</div>
                        <span>${Math.round((amount % 1) * 100) || '00'}</span>
                      </div>
                    </div>

                    <!-- Form Fields -->
                    <div class="form-row">
                      <div class="form-label">Date</div>
                      <div class="form-field">${new Date(transaction.date).toLocaleDateString()}</div>
                    </div>

                    <div class="form-row">
                      <div class="form-label">Received From</div>
                      <div class="form-field">${transaction.accountName || 'Card Account'}</div>
                      <div class="arabic-label">استلمنا من المكرم</div>
                    </div>

                    <div class="form-row">
                      <div class="form-label">The Amount</div>
                      <div class="form-field">${this.numberToWords(Math.floor(amount))} RIYAL AND ${Math.round((amount % 1) * 100)} HALALA</div>
                      <div class="arabic-label">مبلغ وقدره</div>
                    </div>

                    <div class="form-row">
                      <div class="form-label">Cash/Cheque</div>
                      <div class="form-field" style="display: flex; gap: 10mm; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 2mm;">
                          <input type="checkbox" ${transaction.instrumentType === 'Cash' ? 'checked' : ''} style="width: 4mm; height: 4mm;">
                          <span>نقداً</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 2mm;">
                          <input type="checkbox" ${transaction.instrumentType === 'Cheque' ? 'checked' : ''} style="width: 4mm; height: 4mm;">
                          <span>شيك رقم</span>
                        </div>
                        <div>Date تاريخ ${transaction.instrumentDate || ''}</div>
                        <div>On Bank على بنك ${transaction.instrumentBank || ''}</div>
                      </div>
                    </div>

                    <div class="form-row">
                      <div class="form-label">For</div>
                      <div class="form-field">${transaction.commonNarration || ''}</div>
                      <div class="arabic-label">وذلك مقابل</div>
                    </div>

                    <div class="form-row" style="margin-bottom: 20px;">
                      <div class="form-label">Party Balance</div>
                      <div class="form-field" style="text-align: left; padding: 2mm;">${balanceData?.toFixed(1) || '0.0'}</div>
                      <div class="arabic-label">رصيد الحساب</div>
                    </div>

                    <!-- Signatures -->
                    <div class="signatures">
                      <div class="signature">
                        <div class="signature-line">Manager المدير</div>
                      </div>
                      <div class="signature">
                        <div class="signature-line">Accountant المحاسب</div>
                      </div>
                      <div class="signature">
                        <div class="signature-line">Received By المستلم</div>
                      </div>
                    </div>

                  </div>

                  <!-- Footer -->
                  <div class="footer">
                    <img src="/assets/dibaj-footer.png" alt="Footer">
                  </div>
                </div>
              </body>
              </html>
            `;

              if (isMobile || isTab) {
                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.top = '-10000px';
                iframe.style.width = '210mm';
                iframe.style.height = '297mm';
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentWindow?.document;
                iframeDoc?.open();
                iframeDoc?.write(printContent);
                iframeDoc?.close();

                iframe.onload = () => {
                  html2canvas(iframe.contentWindow?.document.body as HTMLElement, {
                    scale: 3,
                    useCORS: true,
                    allowTaint: true,
                    width: 210 * 3.78, // A4 width in pixels (210mm * 3.78 pixels/mm)
                    height: 297 * 3.78, // A4 height in pixels (297mm * 3.78 pixels/mm)
                    windowWidth: 210 * 3.78,
                    windowHeight: 297 * 3.78,
                    logging: true,
                    backgroundColor: '#ffffff'
                  }).then((canvas: HTMLCanvasElement) => {
                    const pdf = new jsPDF({
                      orientation: 'portrait',
                      unit: 'mm',
                      format: 'a4',
                      compress: true
                    });

                    const imgData = canvas.toDataURL('image/jpeg', 1.0);
                    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, '', 'FAST');
                    pdf.save(`ReceiptVoucher-${transaction.transactionNo}.pdf`);

                    document.body.removeChild(iframe);
                  });
                };
              } else {
                const iframe = document.createElement('iframe');
                iframe.style.position = 'absolute';
                iframe.style.top = '-10000px';
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentWindow?.document;
                if (iframeDoc) {
                  iframeDoc.open();
                  iframeDoc.write(printContent);
                  iframeDoc.close();

                  setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();

                    setTimeout(() => {
                      document.body.removeChild(iframe);
                    }, 1000);
                  }, 500);
                }
              }
            },
            error: (error: any) => {
              console.error('Error fetching transaction details:', error);
            }
          });
        },
        error: (error: any) => {
          console.error('Error fetching transaction details:', error);
        }
      });
  }
}