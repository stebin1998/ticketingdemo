import React, { useState } from 'react';
import styles from './Cart.module.css';
import CountdownTimer from '../components/CountdownTimer';
import TicketMiLogo from '../assets/ticketmi-logo.png';

const placeholderTickets = [
  {
    id: 1,
    image: 'https://placehold.co/118x95',
    tier: 'General Admission | Tier 1',
    eventName: 'Event Name',
    price: 15.99,
    quantity: 1,
  },
  {
    id: 2,
    image: 'https://placehold.co/118x95',
    tier: 'General Admission | Tier 2',
    eventName: 'Event Name',
    price: 15.99,
    quantity: 1,
  },
  {
    id: 3,
    image: 'https://placehold.co/118x95',
    tier: 'General Admission | Tier 1',
    eventName: 'Event Name',
    price: 15.99,
    quantity: 1,
  },
];

export default function Cart() {
  const [tickets, setTickets] = useState(placeholderTickets);
  const [discount, setDiscount] = useState('');
  const [timerKey, setTimerKey] = useState(0);

  const handleQuantityChange = (id, newQty) => {
    setTickets(tickets.map(ticket => ticket.id === id ? { ...ticket, quantity: newQty } : ticket));
  };

  const handleRemove = (id) => {
    setTickets(tickets.filter(ticket => ticket.id !== id));
  };

  const subtotal = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const taxable = subtotal * 0.13;
  const total = subtotal + taxable;

  return (
    <div className={styles.cartPage} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="bg-[#A299DA] px-8 py-4 flex justify-between items-center">
        <img src={TicketMiLogo} alt="TicketMi" className="h-12" />
        <button className="bg-[#2D2B8F] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors">
          Logout
        </button>
      </header>
      <main className={styles.main}>
        <div className="max-w-6xl w-full mx-auto px-6 flex flex-row gap-12 items-start">
          <section className={styles.cartSection}>
            <div className={styles.cartTitleRow}>
              <h1 className={styles.cartTitle}>Your Ticket Cart</h1>
              <div className={styles.timer}><CountdownTimer key={timerKey} initialMinutes={5} initialSeconds={0} /></div>
            </div>
            <div className={styles.titleDivider}></div>
            <div className={styles.ticketList}>
              {tickets.map((ticket, idx) => (
                <React.Fragment key={ticket.id}>
                  <div className={styles.ticketCard}>
                    <img src={ticket.image} alt="Ticket" className={styles.ticketImage} />
                    <div className={styles.ticketInfo}>
                      <div className={styles.ticketTitleRow}>
                        <div className={styles.ticketTier}>{ticket.tier}</div>
                      </div>
                      <div className={styles.eventName}>{ticket.eventName}</div>
                      <div className={styles.priceQtyRow}>
                        <div className={styles.price}>${ticket.price.toFixed(2)}</div>
                        <div className={styles.qtyControl}>
                          <button onClick={() => handleQuantityChange(ticket.id, Math.max(1, ticket.quantity - 1))} className={styles.qtyPlainBtn}>-</button>
                          <span className={styles.qtyBox}>{ticket.quantity}</span>
                          <button onClick={() => handleQuantityChange(ticket.id, ticket.quantity + 1)} className={styles.qtyPlainBtn}>+</button>
                        </div>
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => handleRemove(ticket.id)} aria-label="Remove ticket">×</button>
                  </div>
                  {idx !== tickets.length - 1 && <div className={styles.cardDivider}></div>}
                </React.Fragment>
              ))}
            </div>
            <div className={styles.cartActions} style={{ marginBottom: '48px' }}>
              <button className={styles.saveBtn}>Save order for later</button>
              <button className={styles.cancelBtn}>Cancel Order</button>
            </div>
          </section>
          <aside className={styles.sidebar}>
            <div className={styles.discountBox}>
              <label className={styles.discountLabel}>Discount Code</label>
              <div className={styles.boxDivider}></div>
              <input className={styles.discountInput} placeholder="EX. KOTHUFESTSALE" value={discount} onChange={e => setDiscount(e.target.value)} />
              <button className={styles.applyBtn}>Apply Code</button>
            </div>
            <div className={styles.orderSummary}>
              <div className={styles.orderSummaryTitle}>Order Summary</div>
              <div className={styles.boxDivider}></div>
              <div className={styles.summaryRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className={styles.summaryRow}><span>Taxable Amount</span><span>${taxable.toFixed(2)}</span></div>
              <div className={styles.summaryRowTotal}><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <button className={styles.checkoutBtn}>Checkout</button>
          </aside>
        </div>
      </main>
      <footer className="mt-auto bg-[#A299DA] py-6 px-4 md:px-8 flex flex-col md:flex-row items-center md:justify-between text-white">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <img src={TicketMiLogo} alt="TicketMi" className="h-12" />
          <span className="text-base md:text-lg">© 2025 TicketMi. All Rights Reserved.</span>
        </div>
        <div className="flex gap-6 md:gap-12">
          <a href="#about" className="hover:underline text-base md:text-lg">About</a>
          <a href="#contact" className="hover:underline text-base md:text-lg">Contact</a>
          <a href="#privacy" className="hover:underline text-base md:text-lg">Privacy</a>
        </div>
      </footer>
    </div>
  );
} 