export interface Registration {
  id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone: string;
  country: string;
  business_profession: string;
  has_challenge: string;
  challenge_description: string | null;
  created_at: string;
}