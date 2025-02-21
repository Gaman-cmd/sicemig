// frontend/src/components/Orders/OrderList.js
/*import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await orderService.getOrders();
      setOrders(data);
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Order List</h1>
      <ul>
        {orders.map(order => (
          <li key={order.id}>{order.productId} - {order.quantity}</li>
        ))}
      </ul>
    </div>
  );
};

export default OrderList;
*/