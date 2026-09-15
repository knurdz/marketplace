"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Order, OrderItem } from "@/lib/types/models";
import { formatOrderStatus, formatPaymentMethod } from "@/lib/order-display";

type DownloadReceiptButtonProps = {
  order: Order;
  items: OrderItem[];
};

export function DownloadReceiptButton({ order, items }: DownloadReceiptButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Theme colors
      const primaryColor = [15, 23, 42]; // Slate 900
      const secondaryColor = [100, 116, 139]; // Slate 500
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Knurdz Marketplace", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("Receipt / Warranty Certificate", 14, 30);
      
      // Order Details
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      let startY = 45;
      
      doc.text(`Order ID: ${order.$id}`, 14, startY);
      doc.text(`Date: ${order.$createdAt ? new Date(order.$createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`, 14, startY + 7);
      doc.text(`Status: ${formatOrderStatus(order.status)}`, 14, startY + 14);
      doc.text(`Payment Method: ${formatPaymentMethod(order.paymentMethod)}`, 14, startY + 21);
      
      // Shipping Address
      doc.setFont("helvetica", "bold");
      doc.text("Shipping Address:", 120, startY);
      doc.setFont("helvetica", "normal");
      
      const splitAddress = doc.splitTextToSize(order.shippingAddress || "N/A", 70);
      doc.text(splitAddress, 120, startY + 7);
      
      // Items Table
      const tableData = items.map(item => [
        item.title,
        item.quantity.toString(),
        `${order.currency} ${item.unitPrice.toFixed(2)}`,
        `${order.currency} ${item.lineTotal.toFixed(2)}`
      ]);
      
      // @ts-expect-error autotable types are sometimes problematic
      doc.autoTable({
        startY: startY + Math.max(30, splitAddress.length * 7),
        head: [['Item', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
        margin: { top: 10, right: 14, bottom: 10, left: 14 },
      });
      
      // Totals
      // @ts-expect-error autoTable adds lastAutoTable property
      const finalY = doc.lastAutoTable.finalY || 150;
      
      doc.setFont("helvetica", "bold");
      if (order.discountAmount > 0) {
        doc.text(`Discount: -${order.currency} ${order.discountAmount.toFixed(2)}`, pageWidth - 14, finalY + 10, { align: "right" });
        doc.text(`Total: ${order.currency} ${order.totalAmount.toFixed(2)}`, pageWidth - 14, finalY + 17, { align: "right" });
      } else {
        doc.text(`Total: ${order.currency} ${order.totalAmount.toFixed(2)}`, pageWidth - 14, finalY + 10, { align: "right" });
      }
      
      // Footer / Warranty text
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      
      const footerText = "Thank you for shopping at Knurdz Marketplace. This document serves as your official receipt and proof of purchase for warranty purposes. Please retain this document for your records.";
      const splitFooter = doc.splitTextToSize(footerText, pageWidth - 28);
      
      doc.text(splitFooter, 14, finalY + 40);
      
      doc.save(`Receipt_${order.$id}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generatePDF} 
      disabled={isGenerating}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Download Receipt"}
    </Button>
  );
}
