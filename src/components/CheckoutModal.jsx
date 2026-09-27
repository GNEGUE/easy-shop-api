import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function CheckoutModal({ cart, onClose, onOrderSuccess }) {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = 1000; // Frais de livraison standard V1

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return alert("Votre panier est vide.");
    
    setSubmitting(true);

    try {
      // Pour le MVP V1, on associe les articles à la boutique du premier produit
      const shopId = cart[0].shop_id;

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            shop_id: shopId,
            total_products: totalAmount,
            delivery_fee: deliveryFee,
            delivery_address: `Tél: ${phone} | Adresse: ${address}`,
            status: 'en_attente'
          }
        ])
        .select();

      if (error) throw error;

      alert("🎉 Commande envoyée avec succès à la boutique !");
      onOrderSuccess();
      onClose();
    } catch (err) {
      alert("Erreur lors de la commande : " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🛒 Finaliser la commande</h2>
        
        <div className="mb-4 bg-gray-50 p-3 rounded-lg text-sm">
          <p>Sous-total : <span className="font-semibold">{totalAmount.toLocaleString()} FCFA</span></p>
          <p>Livraison : <span className="font-semibold">{deliveryFee.toLocaleString()} FCFA</span></p>
          <p className="text-emerald-600 font-bold text-base mt-1">Total : {(totalAmount + deliveryFee).toLocaleString()} FCFA</p>
        </div>

        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Numéro de téléphone (WhatsApp)</label>
            <input 
              type="tel" 
              required
              placeholder="Ex: 90 00 00 00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse & Repères précis (Lomé)</label>
            <textarea 
              required
              rows="3"
              placeholder="Ex: Agbalépédogan, à 50m de la pharmacie, maison portail bleu"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm outline-emerald-600"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="w-1/2 border py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-1/2 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
            >
              {submitting ? 'Envoi...' : 'Commander'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
