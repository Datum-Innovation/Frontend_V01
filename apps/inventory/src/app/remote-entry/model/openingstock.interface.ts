export interface OpenStock{
    id: number,
  voucherNo: string,
  warehouse: {
    id: number,
    value: string
  },
  date: string,
  currency: {
    id: number,
    value: string
  },
  exchangeRate: number,
  terms: string,
  items: ItemStock
}
    
  interface ItemStock{
      transactionId: number,
      itemId: number,
      itemCode: string,
      itemName: string,
      location: string,
      batchNo: string,
      unit: {
        unit: string,
        basicUnit: string,
        factor: number
      },
      qty: number,
      focQty: number,
      basicQty: number,
      additional: number,
      rate: number,
      otherRate: number,
      margin: number,
      rateDisc: number,
      grossAmt: number,
      discount: number,
      discountPerc: number,
      amount: number,
      taxValue: number,
      taxPerc: number,
      printedMRP: number,
      ptsRate: number,
      ptrRate: number,
      pcs: number,
      stockItemId: number,
      total: number,
      expiryDate: string,
      description: string,
      lengthFt: number,
      lengthIn: number,
      lengthCm: number,
      girthFt: number,
      girthIn: number,
      girthCm: number,
      thicknessFt: number,
      thicknessIn: number,
      thicknessCm: number,
      remarks: string,
      taxTypeId: number,
      taxAccountId: number,
      costAccountId: number,
      brandId: number,
      profit: number,
      repairsRequired: string,
      finishDate: string,
      updateDate: string,
      replaceQty: number,
      printedRate: number,
      hsn: string,
      priceCategory: {
        id: number,
        name: string,
        code: string,
        description: string
      },
      sizeMaster: {
        id: number,
        name: string,
        code: string,
        description: string
      },
      avgCost: number,
      isReturn: boolean,
      manufactureDate: string,
      uniqueItems: [
        {
          uniqueNumber: string
        }
      ],
      tempRate: number,
      orderQty: number,
      refTransItemId: number
    }
  

