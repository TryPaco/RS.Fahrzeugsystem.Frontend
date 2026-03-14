export type Customer = {
  id: string;
  customerNumber: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  city?: string;
  isArchived: boolean;
};

export type CreateCustomerRequest = {
  customerNumber: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  notes?: string;
};
