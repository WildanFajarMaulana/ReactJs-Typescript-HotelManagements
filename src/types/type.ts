// types.ts

export type User = {
    id: number;
    name: string;
    email: string;
    password: string;
    phone: number;
    role: string;
  };
  
  export type Review = {
    id: number;
    reservation_id : number;
    user_id: number;
    room_id: number;
    amount: number;
    rating: number;
    review_text: string;
    user: User;
  };
  
  export type Reservation = {
    id: number;
    user_id: number;
    room_id: number;
    check_in_date: Date;
    check_out_date: Date;
    total_price: number;
    reservation_status: string;
    reservation_code: string;
    room: Room;
    payment: Payment
  };
  
  export type Payment = {
    reservation_id: number;
    payment_method: string;
    amount: number;
    payment_status: boolean;
    proof: string;
  };

  export type RoomFacilitys = {
    id: number;
    room_id: number;
    facility_name: string;
  };
  
  export type RoomAvailability = {
    id: number;
    room_id: number;
    date: Date;
    is_available: boolean;
  };
  
  export type Room = {
    id: number;
    room_name: string;
    room_slug: string;
    room_type: string;
    price_per_night: number;
    capacity: number;
    description: string;
    image_url: string;
    status: string;
    room_facilitys: RoomFacilitys[]; // Relasi dengan RoomFacility
    roomAvaibilitys: RoomAvailability[]; // Relasi dengan RoomAvailability
    reviews: Review[]; // Relasi dengan Review
  };
  