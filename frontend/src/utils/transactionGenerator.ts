export interface TransactionTemplate {
  type: 'deposit' | 'withdrawal';
  category: string;
  descriptions: string[];
  amountRange: [number, number];
  frequency?: number; // How often this type appears (1-10, 10 being most common)
}

export const TRANSACTION_TEMPLATES: TransactionTemplate[] = [
  // Deposit Types
  { 
    type: 'deposit', 
    category: 'Payroll', 
    descriptions: ['PAYROLL ACH DEPOSIT', 'DIRECT DEPOSIT PAYROLL', 'SALARY DEPOSIT'], 
    amountRange: [1000, 5000],
    frequency: 8
  },
  { 
    type: 'deposit', 
    category: 'Transfer', 
    descriptions: ['ONLINE TRANSFER', 'MOBILE DEPOSIT', 'WIRE TRANSFER', 'ACH TRANSFER'], 
    amountRange: [100, 2000],
    frequency: 6
  },
  { 
    type: 'deposit', 
    category: 'Interest', 
    descriptions: ['INTEREST PAYMENT', 'SAVINGS INTEREST', 'CHECKING INTEREST'], 
    amountRange: [0.50, 25],
    frequency: 3
  },
  { 
    type: 'deposit', 
    category: 'Refund', 
    descriptions: ['TAX REFUND', 'PURCHASE REFUND', 'CASHBACK REWARD', 'RETURN CREDIT'], 
    amountRange: [10, 500],
    frequency: 4
  },
  { 
    type: 'deposit', 
    category: 'Check Deposit', 
    descriptions: ['MOBILE CHECK DEPOSIT', 'ATM CHECK DEPOSIT', 'BRANCH CHECK DEPOSIT'], 
    amountRange: [50, 1000],
    frequency: 5
  },

  // Withdrawal Types - Grocery Stores
  { 
    type: 'withdrawal', 
    category: 'Grocery Store', 
    descriptions: [
      'WHOLE FOODS MARKET #123', 'SAFEWAY STORE #456', 'KROGER #789', 'WALMART SUPERCENTER #012',
      'TARGET STORE #345', 'COSTCO WHOLESALE #678', 'TRADER JOES #901', 'PUBLIX SUPER MARKET #234',
      'HARRIS TEETER #567', 'FOOD LION #890', 'GIANT FOOD #123', 'STOP & SHOP #456',
      'WEGMANS #789', 'H-E-B #012', 'MEIJER #345', 'ALDI #678'
    ], 
    amountRange: [25, 200],
    frequency: 9
  },

  // Restaurants & Food
  { 
    type: 'withdrawal', 
    category: 'Restaurant', 
    descriptions: [
      'STARBUCKS STORE #345', 'MCDONALDS #678', 'CHIPOTLE MEXICAN GRILL', 'SUBWAY #901',
      'PANERA BREAD #234', 'CHICK-FIL-A #567', 'TACO BELL #890', 'PIZZA HUT #123',
      'DOMINOS PIZZA #456', 'OLIVE GARDEN #789', 'APPLEBEES #012', 'CHILIS #345',
      'OUTBACK STEAKHOUSE', 'RED LOBSTER #678', 'BUFFALO WILD WINGS', 'DENNYS #901',
      'IHOP #234', 'CRACKER BARREL #567', 'TEXAS ROADHOUSE', 'FIVE GUYS #890'
    ], 
    amountRange: [8, 75],
    frequency: 8
  },

  // Gas Stations
  { 
    type: 'withdrawal', 
    category: 'Gas Station', 
    descriptions: [
      'SHELL OIL #234', 'CHEVRON #567', 'EXXON MOBIL #890', 'BP GAS STATION #123',
      'TEXACO #456', 'MARATHON #789', 'SUNOCO #012', 'CITGO #345',
      'VALERO #678', 'SPEEDWAY #901', 'WAWA #234', 'SHEETZ #567',
      '7-ELEVEN #890', 'CIRCLE K #123', 'CASEY\'S GENERAL STORE', 'PILOT TRAVEL CENTER'
    ], 
    amountRange: [25, 85],
    frequency: 7
  },

  // Online Purchases
  { 
    type: 'withdrawal', 
    category: 'Online Purchase', 
    descriptions: [
      'AMAZON.COM AMZN.COM/BILL', 'PAYPAL *MERCHANT', 'APPLE.COM/BILL', 'NETFLIX.COM',
      'SPOTIFY USA', 'HULU', 'DISNEY PLUS', 'HBO MAX', 'YOUTUBE PREMIUM',
      'MICROSOFT STORE', 'GOOGLE PLAY', 'STEAM PURCHASE', 'EBAY.COM',
      'ETSY.COM', 'WALMART.COM', 'TARGET.COM', 'BESTBUY.COM', 'HOMEDEPOT.COM'
    ], 
    amountRange: [10, 300],
    frequency: 9
  },

  // ATM Withdrawals
  { 
    type: 'withdrawal', 
    category: 'ATM Withdrawal', 
    descriptions: [
      'ATM WITHDRAWAL - MAIN ST', 'CASH WITHDRAWAL - DOWNTOWN', 'ATM FEE - BANK LOCATION',
      'ATM WITHDRAWAL - MALL', 'CASH ADVANCE - ATM', 'ATM WITHDRAWAL - AIRPORT',
      'ATM WITHDRAWAL - GROCERY', 'ATM WITHDRAWAL - GAS STATION'
    ], 
    amountRange: [20, 300],
    frequency: 6
  },

  // Utilities & Bills
  { 
    type: 'withdrawal', 
    category: 'Utility Bill', 
    descriptions: [
      'ELECTRIC COMPANY AUTO PAY', 'WATER DEPT MONTHLY', 'INTERNET SERVICE PROVIDER',
      'CABLE TV MONTHLY', 'CELL PHONE BILL', 'NATURAL GAS COMPANY', 'TRASH SERVICE',
      'SEWER SERVICE', 'SECURITY SYSTEM', 'HOME INSURANCE'
    ], 
    amountRange: [35, 250],
    frequency: 5
  },

  // Transportation
  { 
    type: 'withdrawal', 
    category: 'Transportation', 
    descriptions: [
      'UBER TRIP', 'LYFT RIDE', 'METRO TRANSIT', 'PARKING METER', 'TOLL ROAD',
      'CAR INSURANCE', 'AUTO REPAIR SHOP', 'OIL CHANGE', 'CAR WASH', 'PARKING GARAGE'
    ], 
    amountRange: [5, 150],
    frequency: 6
  },

  // Entertainment
  { 
    type: 'withdrawal', 
    category: 'Entertainment', 
    descriptions: [
      'MOVIE THEATER', 'CONCERT VENUE', 'SPORTS EVENT', 'BOWLING ALLEY',
      'MINI GOLF', 'ARCADE', 'THEME PARK', 'MUSEUM', 'ZOO', 'AQUARIUM'
    ], 
    amountRange: [15, 100],
    frequency: 4
  },

  // Shopping
  { 
    type: 'withdrawal', 
    category: 'Shopping', 
    descriptions: [
      'DEPARTMENT STORE', 'CLOTHING STORE', 'ELECTRONICS STORE', 'BOOKSTORE',
      'PHARMACY', 'HARDWARE STORE', 'SPORTING GOODS', 'JEWELRY STORE',
      'FURNITURE STORE', 'HOME GOODS STORE'
    ], 
    amountRange: [20, 500],
    frequency: 7
  },

  // Healthcare
  { 
    type: 'withdrawal', 
    category: 'Healthcare', 
    descriptions: [
      'DOCTORS OFFICE', 'DENTIST OFFICE', 'PHARMACY PRESCRIPTION', 'URGENT CARE',
      'HOSPITAL', 'VETERINARIAN', 'OPTOMETRIST', 'PHYSICAL THERAPY'
    ], 
    amountRange: [25, 300],
    frequency: 3
  },

  // Financial Services
  { 
    type: 'withdrawal', 
    category: 'Financial Services', 
    descriptions: [
      'CREDIT CARD PAYMENT', 'LOAN PAYMENT', 'MORTGAGE PAYMENT', 'STUDENT LOAN',
      'INVESTMENT TRANSFER', 'SAVINGS TRANSFER', 'RETIREMENT CONTRIBUTION'
    ], 
    amountRange: [100, 2000],
    frequency: 5
  },

  // Cash App & Digital Payments
  { 
    type: 'withdrawal', 
    category: 'Digital Payment', 
    descriptions: [
      'CASH APP PAYMENT', 'VENMO PAYMENT', 'ZELLE TRANSFER', 'PAYPAL TRANSFER',
      'APPLE PAY CASH', 'GOOGLE PAY', 'FACEBOOK PAY'
    ], 
    amountRange: [10, 200],
    frequency: 7
  },

  // Subscriptions
  { 
    type: 'withdrawal', 
    category: 'Subscription', 
    descriptions: [
      'NETFLIX MONTHLY', 'SPOTIFY PREMIUM', 'AMAZON PRIME', 'ADOBE CREATIVE',
      'MICROSOFT 365', 'DROPBOX', 'ICLOUD STORAGE', 'GYM MEMBERSHIP',
      'MAGAZINE SUBSCRIPTION', 'NEWS SUBSCRIPTION'
    ], 
    amountRange: [5, 50],
    frequency: 6
  }
];

export const generateRandomTransactions = (
  startDate: Date, 
  endDate: Date, 
  count: number,
  includePaystubDeposits: boolean = false,
  paystubData?: any[]
): Array<{
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  balance: number;
  category: string;
}> => {
  const transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    balance: number;
    category: string;
  }> = [];

  // Add paystub deposits if requested
  if (includePaystubDeposits && paystubData) {
    paystubData.forEach((paystub, index) => {
      const payDate = new Date(paystub.payDate);
      if (payDate >= startDate && payDate <= endDate) {
        transactions.push({
          id: `paystub-${index}`,
          date: paystub.payDate,
          description: `${paystub.companyName} Payroll ACH Deposit`,
          amount: paystub.netPay,
          type: 'deposit',
          balance: 0, // Will be calculated later
          category: 'Payroll'
        });
      }
    });
  }

  // Generate random transactions
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < count; i++) {
    // Weight selection based on frequency
    const weightedTemplates: TransactionTemplate[] = [];
    TRANSACTION_TEMPLATES.forEach(template => {
      const frequency = template.frequency || 5;
      for (let j = 0; j < frequency; j++) {
        weightedTemplates.push(template);
      }
    });
    
    const template = weightedTemplates[Math.floor(Math.random() * weightedTemplates.length)];
    const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    const amount = Math.random() * (template.amountRange[1] - template.amountRange[0]) + template.amountRange[0];
    
    // Generate random date within the period
    const randomDays = Math.floor(Math.random() * daysDiff);
    const transactionDate = new Date(startDate);
    transactionDate.setDate(startDate.getDate() + randomDays);
    
    transactions.push({
      id: `random-${i}`,
      date: transactionDate.toISOString().split('T')[0],
      description,
      amount: parseFloat(amount.toFixed(2)),
      type: template.type,
      balance: 0, // Will be calculated later
      category: template.category
    });
  }
  
  // Sort transactions by date
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return transactions;
};

export const calculateRunningBalances = (
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    balance: number;
    category: string;
  }>, 
  openingBalance: number
): Array<{
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  balance: number;
  category: string;
}> => {
  let runningBalance = openingBalance;
  
  return transactions.map(transaction => {
    if (transaction.type === 'deposit') {
      runningBalance += transaction.amount;
    } else {
      runningBalance -= transaction.amount;
    }
    
    return {
      ...transaction,
      balance: parseFloat(runningBalance.toFixed(2))
    };
  });
};