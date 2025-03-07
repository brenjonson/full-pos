"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; 
import { QRCodeSVG } from 'qrcode.react';

interface OrderData {
  orderID: number;
  orderItemId: string;
  Tables_tabID: number;
  tabName?: string;
}

export default function QRCodePage({ params }: { params: { id: string } }) {
  // ใช้ params.id โดยตรง แต่ในอนาคตควรใช้ React.use()
  // ตามคำแนะนำของ Next.js
  const id = params.id;
  
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderData() {
      try {
        console.log("Fetching order data for ID:", id);
        const response = await fetch(`/api/orders/get?id=${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order data: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Order data received:", data);
        setOrderData(data);
      } catch (err: any) {
        console.error("Error fetching order data:", err);
        setError(err.message || "Failed to fetch order data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderData();
  }, [id]);

  // สร้าง URL สำหรับ QR Code
  const getMenuUrl = () => {
    if (!orderData) return '';
    
    // URL ที่จะแสดงในคิวอาร์โค้ด (URL ของหน้าเมนูสำหรับลูกค้า)
    return `${window.location.origin}/user/menu/${orderData.orderItemId}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={handleGoBack}>กลับ</Button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูลออเดอร์</h2>
          <Button onClick={handleGoBack}>กลับ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={handleGoBack} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับ
        </Button>
        <Button onClick={handlePrint} className="flex items-center">
          <Printer className="mr-2 h-4 w-4" />
          พิมพ์
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">QR Code สำหรับสั่งอาหาร</h1>
            <p className="text-gray-500">
              โต๊ะ {orderData.tabName || `T${orderData.Tables_tabID.toString().padStart(2, '0')}`}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="border p-4 inline-block">
              <QRCodeSVG 
                value={getMenuUrl()}
                size={256}
                level="H"
                includeMargin={true}
                className="w-64 h-64"
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">สแกนเพื่อสั่งอาหาร</p>
            <p className="text-xs text-gray-400">Order ID: {orderData.orderID}</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Hana Shabu. All rights reserved.</p>
      </div>
    </div>
  );
}