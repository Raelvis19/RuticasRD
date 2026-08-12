export interface PaymentAccount {
  bank: string;
  accountNumber: string;
  accountType: string;
  accountHolder: string;
}

export const paymentAccounts: readonly PaymentAccount[] = [
  {
    bank: "Banco Popular",
    accountNumber: "815766142",
    accountType: "Cuenta Corriente",
    accountHolder: "Leury Alejandro Velez Cordero",
  },
  {
    bank: "Banreservas",
    accountNumber: "9607881220",
    accountType: "Cuenta de Ahorro",
    accountHolder: "Leury Alejandro Velez Cordero",
  },
];
