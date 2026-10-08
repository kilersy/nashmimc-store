let cart = [];
let selectedPaymentMethod = 'paypal';
let discountPercent = 0;
let appliedCouponName = '';

document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    renderUserOrders();
    setInterval(syncOrdersFromServer, 3000);
});

function initDropdowns() {
    const smpNavBtn = document.getElementById('smpNavBtn');
    const smpDropdown = document.getElementById('smpDropdown');
    const boxNavBtn = document.getElementById('boxNavBtn');
    const boxDropdown = document.getElementById('boxDropdown');

    if (smpNavBtn && smpDropdown) {
        smpNavBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (boxDropdown) boxDropdown.classList.remove('show');
            smpDropdown.classList.toggle('show');
        });
    }

    if (boxNavBtn && boxDropdown) {
        boxNavBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (smpDropdown) smpDropdown.classList.remove('show');
            boxDropdown.classList.toggle('show');
        });
    }

    document.addEventListener('click', () => {
        if (smpDropdown) smpDropdown.classList.remove('show');
        if (boxDropdown) boxDropdown.classList.remove('show');
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.store-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }
}

function toggleCartDrawer() {
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer) cartDrawer.classList.toggle('active');
}

function toggleNavDrawer() {
    const sideDrawer = document.getElementById('sideDrawer');
    if (sideDrawer) sideDrawer.classList.toggle('active');
}

function toggleColorOptions() {
    const chkColor = document.getElementById('chkColor')?.checked;
    const container = document.getElementById('colorOptionsContainer');
    if (container) container.style.display = chkColor ? 'block' : 'none';
    updateCustomPreview();
}

function toggleGradientMode(isGradient) {
    const secGroup = document.getElementById('secondaryColorGroup');
    if (secGroup) secGroup.style.display = isGradient ? 'block' : 'none';
    updateCustomPreview();
}

function updateCustomPreview() {
    const nameInput = document.getElementById('customName')?.value.trim() || 'KING';
    const previewEl = document.getElementById('liveRankPreview');
    const colorHexCodeDisplay = document.getElementById('colorHexCodeDisplay');
    const chkColor = document.getElementById('chkColor')?.checked;

    if (!previewEl) return;

    if (!chkColor) {
        previewEl.style.background = 'none';
        previewEl.style.color = '#fbbf24';
        previewEl.style.webkitBackgroundClip = 'initial';
        previewEl.style.webkitTextFillColor = 'initial';
        previewEl.innerText = `[${nameInput.toUpperCase()}]`;
        if (colorHexCodeDisplay) colorHexCodeDisplay.innerText = 'Color Styling: Default (#fbbf24)';
        return;
    }

    const isGradient = document.querySelector('input[name="colorType"]:checked')?.value === 'gradient';
    const pColor = document.getElementById('primaryRankColor')?.value || '#ffffff';

    if (isGradient) {
        const sColor = document.getElementById('secondaryRankColor')?.value || '#ffffff';
        previewEl.style.background = `linear-gradient(90deg, ${pColor}, ${sColor})`;
        previewEl.style.webkitBackgroundClip = 'text';
        previewEl.style.webkitTextFillColor = 'transparent';
        previewEl.innerText = `[${nameInput.toUpperCase()}]`;
        if (colorHexCodeDisplay) colorHexCodeDisplay.innerText = `Gradient HEX: ${pColor} ➔ ${sColor}`;
    } else {
        previewEl.style.background = 'none';
        previewEl.style.color = pColor;
        previewEl.style.webkitBackgroundClip = 'initial';
        previewEl.style.webkitTextFillColor = 'initial';
        previewEl.innerText = `[${nameInput.toUpperCase()}]`;
        if (colorHexCodeDisplay) colorHexCodeDisplay.innerText = `Solid HEX Code: ${pColor}`;
    }

    calcCustomPrice();
}

function calcCustomPrice() {
    let price = 5.00;
    const pv = parseInt(document.getElementById('customPv')?.value) || 0;
    const homes = parseInt(document.getElementById('customHomes')?.value) || 2;
    const ecPrice = parseFloat(document.getElementById('customEc')?.value) || 0;

    price += pv * 3.00;
    if (homes > 2) price += (homes - 2) * 1.50;
    price += ecPrice;

    if (document.getElementById('chkAnvil')?.checked) price += 3.00;
    if (document.getElementById('chkTags')?.checked) price += 4.00;
    if (document.getElementById('chkSafeRoom')?.checked) price += 5.00;
    if (document.getElementById('chkColor')?.checked) price += 3.00;

    const display = document.getElementById('customPriceDisplay');
    if (display) display.innerText = `$${price.toFixed(2)}`;
    return price;
}

function getCustomRankDetails() {
    const rawName = document.getElementById('customName')?.value.trim().toUpperCase() || 'KING';
    const pv = document.getElementById('customPv')?.value || 0;
    const homes = document.getElementById('customHomes')?.value || 2;
    const ecSelect = document.getElementById('customEc');
    const ecText = ecSelect ? ecSelect.options[ecSelect.selectedIndex].text : 'None';

    const anvil = document.getElementById('chkAnvil')?.checked ? 'Yes' : 'No';
    const tags = document.getElementById('chkTags')?.checked ? 'Yes' : 'No';
    const safeRoom = document.getElementById('chkSafeRoom')?.checked ? 'Yes' : 'No';
    const hasColor = document.getElementById('chkColor')?.checked;

    let colorInfo = 'Default Accent Color';
    if (hasColor) {
        const isGradient = document.querySelector('input[name="colorType"]:checked')?.value === 'gradient';
        const pColor = document.getElementById('primaryRankColor')?.value || '#ffffff';
        if (isGradient) {
            const sColor = document.getElementById('secondaryRankColor')?.value || '#ffffff';
            colorInfo = `Gradient (${pColor} to ${sColor})`;
        } else {
            colorInfo = `Solid (${pColor})`;
        }
    }

    return {
        name: rawName,
        details: `Rank Name: [${rawName}] | Color: ${colorInfo} | PVs: ${pv} | Homes: ${homes} | EC: ${ecText} | Anvil: ${anvil} | Tags: ${tags} | SafeRoom: ${safeRoom}`
    };
}

function addCustomToCart() {
    const rankObj = getCustomRankDetails();
    const price = calcCustomPrice();
    cart.push({
        title: `Custom Rank: [${rankObj.name}]`,
        price: price,
        details: rankObj.details
    });
    updateCartUI();
    toggleCartDrawer();
}

function buyCustomNow() {
    const rankObj = getCustomRankDetails();
    const price = calcCustomPrice();
    cart.push({
        title: `Custom Rank: [${rankObj.name}]`,
        price: price,
        details: rankObj.details
    });
    updateCartUI();
    openCheckoutModal();
}

function addToCart(title, price) {
    cart.push({ title, price });
    updateCartUI();
    showNotification('<i class="fa-solid fa-cart-plus"></i>', 'Added to Cart', `<strong>${title}</strong> has been added to your shopping cart.`);
}

function buyNow(title, price) {
    cart.push({ title, price });
    updateCartUI();
    openCheckoutModal();
}

function updateKeyPrice(priceElemId, unitPrice, qty) {
    const total = (unitPrice * Math.max(1, qty)).toFixed(2);
    const elem = document.getElementById(priceElemId);
    if (elem) elem.innerText = `$${total}`;
}

function addKeyToCart(keyName, unitPrice, qtyInputId) {
    const qtyInput = document.getElementById(qtyInputId);
    const qty = parseInt(qtyInput?.value) || 1;
    const totalPrice = unitPrice * qty;
    cart.push({
        title: `${qty}x ${keyName}`,
        price: totalPrice
    });
    updateCartUI();
    showNotification('<i class="fa-solid fa-key"></i>', 'Keys Added', `Added ${qty}x ${keyName} to your cart.`);
}

function buyKeyNow(keyName, unitPrice, qtyInputId) {
    const qtyInput = document.getElementById(qtyInputId);
    const qty = parseInt(qtyInput?.value) || 1;
    const totalPrice = unitPrice * qty;
    cart.push({
        title: `${qty}x ${keyName}`,
        price: totalPrice
    });
    updateCartUI();
    openCheckoutModal();
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cartTotalDisplay');

    if (!container || !countEl || !totalEl) return;

    container.innerHTML = '';
    countEl.innerText = cart.length;

    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price;
        const itemCard = document.createElement('div');
        itemCard.className = 'cart-item-card';
        itemCard.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-title">${item.title}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(itemCard);
    });

    const finalTotal = subtotal * (1 - discountPercent / 100);
    totalEl.innerText = `$${finalTotal.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function clearCart() {
    cart = [];
    discountPercent = 0;
    appliedCouponName = '';
    const couponInput = document.getElementById('couponCodeInput');
    const msg = document.getElementById('couponMsg');
    if (couponInput) couponInput.value = '';
    if (msg) msg.innerText = '';
    updateCartUI();
}

function applyCoupon() {
    const code = document.getElementById('couponCodeInput')?.value.trim().toUpperCase();
    const msg = document.getElementById('couponMsg');

    if (!msg) return;

    if (code === 'NASHMI2026') {
        discountPercent = 15;
        appliedCouponName = code;
        msg.style.color = 'var(--success)';
        msg.innerText = 'Coupon NASHMI2026 applied! (15% OFF)';
    } else {
        discountPercent = 0;
        appliedCouponName = '';
        msg.style.color = 'var(--danger)';
        msg.innerText = 'Invalid Coupon Code!';
    }
    updateCartUI();
}

function openCheckoutModal() {
    if (cart.length === 0) {
        showNotification('<i class="fa-solid fa-circle-exclamation" style="color:var(--accent)"></i>', 'Empty Cart', 'Your shopping cart is empty.');
        return;
    }
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.style.display = 'flex';
    setPaymentMethod(selectedPaymentMethod);
    renderPayPalButtons();
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.style.display = 'none';
}

function setPaymentMethod(method) {
    selectedPaymentMethod = method;
    const tabPaypal = document.getElementById('tabPaypal');
    const tabCrypto = document.getElementById('tabCrypto');
    const paypalContainer = document.getElementById('paypalContainer');
    const cryptoDetails = document.getElementById('cryptoDetails');

    if (tabPaypal) tabPaypal.classList.toggle('active', method === 'paypal');
    if (tabCrypto) tabCrypto.classList.toggle('active', method === 'crypto');
    if (paypalContainer) paypalContainer.style.display = method === 'paypal' ? 'block' : 'none';
    if (cryptoDetails) cryptoDetails.style.display = method === 'crypto' ? 'block' : 'none';
}

function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    if (typeof paypal === 'undefined') return;

    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let finalTotal = (subtotal * (1 - discountPercent / 100)).toFixed(2);

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: finalTotal }
                }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
                processCheckoutWebhook('PayPal Approved - ' + details.id);
            });
        }
    }).render('#paypal-button-container');
}

function processCheckoutWebhook(paymentReference = 'Manual/Crypto Pending') {
    const ign = document.getElementById('checkoutIgnInput')?.value.trim() || 'Not Provided';
    const discordUser = document.getElementById('checkoutDiscordInput')?.value.trim() || 'Not Provided';
    const proofInput = document.getElementById('checkoutProofImage');
    const orderId = 'NASHMI-' + Math.floor(100000 + Math.random() * 900000);
    let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    let finalTotal = (subtotal * (1 - discountPercent / 100)).toFixed(2);

    const imageFile = (proofInput && proofInput.files && proofInput.files[0]) ? proofInput.files[0] : null;

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            sendOrderWithImage(orderId, ign, discordUser, finalTotal, event.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        sendOrderWithImage(orderId, ign, discordUser, finalTotal, null);
    }
}

function sendOrderWithImage(orderId, ign, discordUser, finalTotal, imageProof) {
    const orderData = {
        orderId: orderId,
        ign: ign,
        discordUser: discordUser,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        total: finalTotal,
        items: cart,
        date: new Date().toLocaleDateString(),
        status: 'Pending',
        imageProof: imageProof
    };

    fetch('http://localhost:3000/api/new-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(data => {
        finalizeOrderSuccess(orderId, finalTotal);
    })
    .catch(err => {
        console.log("Error connecting to bot server, saving locally:", err);
        finalizeOrderSuccess(orderId, finalTotal);
    });
}

function finalizeOrderSuccess(orderId, finalTotal) {
    saveOrderToHistory({
        id: orderId,
        date: new Date().toLocaleDateString(),
        total: finalTotal,
        status: 'Pending',
        items: cart
    });

    closeCheckoutModal();
    clearCart();
    
    showOrderSuccessNotification(
        orderId,
        'Your order details have been successfully sent to Discord.<br>Execution and response time inside the server is within <strong>3 to 4 hours maximum</strong>.'
    );
    
    switchSection('tracking-section');
}

function syncOrdersFromServer() {
    fetch('http://localhost:3000/api/orders')
        .then(res => res.json())
        .then(serverOrders => {
            let history = JSON.parse(localStorage.getItem('nashmi_orders') || '[]');
            let updated = false;
            history.forEach(localOrd => {
                const srvOrd = serverOrders.find(o => o.id === localOrd.id);
                if (srvOrd && srvOrd.status !== localOrd.status) {
                    localOrd.status = srvOrd.status;
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem('nashmi_orders', JSON.stringify(history));
                renderUserOrders();
            }
        })
        .catch(e => {});
}

function showOrderSuccessNotification(orderId, message) {
    const icon = document.getElementById('notifIcon');
    const titleEl = document.getElementById('notifTitle');
    const msg = document.getElementById('notifMsg');
    const modal = document.getElementById('notificationModal');
    const actionsContainer = document.getElementById('notifActions');

    if (icon) icon.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>';
    if (titleEl) titleEl.innerHTML = 'Order Submitted Successfully!';
    if (msg) {
        msg.innerHTML = `Your Order ID: <strong style="color:var(--accent); font-size:1.2rem;">${orderId}</strong><br><br>${message}`;
    }
    
    if (actionsContainer) {
        actionsContainer.innerHTML = `
            <button onclick="copyOrderId('${orderId}')" style="background: var(--accent); border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; color: var(--bg-dark); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-copy"></i> Copy Order ID
            </button>
            <button class="btn-modal-ok" onclick="closeNotificationModal()" style="padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                OK
            </button>
        `;
    }

    if (modal) modal.style.display = 'flex';
}

function copyOrderId(orderId) {
    navigator.clipboard.writeText(orderId);
    showNotification('<i class="fa-solid fa-copy"></i>', 'Copied', 'Order ID copied to clipboard successfully!');
}

function saveOrderToHistory(order) {
    let history = JSON.parse(localStorage.getItem('nashmi_orders') || '[]');
    history.unshift(order);
    localStorage.setItem('nashmi_orders', JSON.stringify(history));
    renderUserOrders();
}

function renderUserOrders() {
    const container = document.getElementById('userOrdersContainer');
    if (!container) return;

    let history = JSON.parse(localStorage.getItem('nashmi_orders') || '[]');
    container.innerHTML = '';

    if (history.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No active orders found on this device.</p>';
        return;
    }

    history.forEach(ord => {
        const itemEl = document.createElement('div');
        itemEl.style.cssText = 'background:var(--bg-dark); border:1px solid var(--border); padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;';
        
        let statusBadgeClass = 'status-pending';
        let statusIcon = 'fa-clock';
        if (ord.status === 'Approved' || ord.status === 'مقبول') {
            statusBadgeClass = 'status-success';
            statusIcon = 'fa-check';
            ord.status = 'Approved';
        } else if (ord.status === 'Rejected' || ord.status === 'مرفوض') {
            statusBadgeClass = 'status-danger';
            statusIcon = 'fa-xmark';
            ord.status = 'Rejected';
        } else {
            ord.status = 'Pending';
        }

        itemEl.innerHTML = `
            <div>
                <strong style="color:var(--accent); font-size:1rem;">${ord.id}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Date: ${ord.date} | Total: $${ord.total}</div>
            </div>
            <span class="status-badge ${statusBadgeClass}"><i class="fa-solid ${statusIcon}"></i> ${ord.status}</span>
        `;
        container.appendChild(itemEl);
    });
}

function trackOrder() {
    const input = document.getElementById('trackingInput')?.value.trim();
    const resultBox = document.getElementById('trackingResultBox');
    const resultText = document.getElementById('trackingResultText');

    if (!input) {
        showNotification('<i class="fa-solid fa-triangle-exclamation"></i>', 'Track Order', 'Please enter a valid Order ID.');
        return;
    }

    let history = JSON.parse(localStorage.getItem('nashmi_orders') || '[]');
    let found = history.find(o => o.id.toUpperCase() === input.toUpperCase());

    if (resultBox) resultBox.style.display = 'block';

    if (resultText) {
        if (found) {
            let itemsStr = found.items.map(i => `• ${i.title} ($${i.price.toFixed(2)})`).join('<br>');
            resultText.innerHTML = `
                <strong>Order ID:</strong> ${found.id}<br>
                <strong>Date:</strong> ${found.date}<br>
                <strong>Total:</strong> $${found.total}<br>
                <strong>Status:</strong> <span class="status-badge"><i class="fa-solid fa-info-circle"></i> ${found.status}</span><br><br>
                <strong>Items Included:</strong><br>${itemsStr}
            `;
        } else {
            resultText.innerHTML = `<strong>Order ID:</strong> ${input}<br><strong>Status:</strong> Not Found`;
        }
    }
}

function copyHomeServerIp() {
    navigator.clipboard.writeText('play.nashmimc.net');
    showNotification('<i class="fa-solid fa-copy"></i>', 'IP Copied', 'Server IP copied to clipboard!');
}

function copyServerIp() {
    copyHomeServerIp();
}

function copyWallet() {
    const addr = document.getElementById('walletAddr')?.innerText || '';
    navigator.clipboard.writeText(addr);
    showNotification('<i class="fa-solid fa-copy"></i>', 'Wallet Copied', 'Binance TRC20 Wallet Address copied!');
}

function showNotification(iconHtml, title, message) {
    const icon = document.getElementById('notifIcon');
    const titleEl = document.getElementById('notifTitle');
    const msg = document.getElementById('notifMsg');
    const modal = document.getElementById('notificationModal');
    const actionsContainer = document.getElementById('notifActions');

    if (icon) icon.innerHTML = iconHtml;
    if (titleEl) titleEl.innerHTML = title;
    if (msg) msg.innerHTML = message;
    
    if (actionsContainer) {
        actionsContainer.innerHTML = `
            <button class="btn-modal-ok" onclick="closeNotificationModal()" style="padding: 10px 22px; border-radius: 8px; font-weight: bold; cursor: pointer;">OK</button>
        `;
    }

    if (modal) modal.style.display = 'flex';
}

function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.style.display = 'none';
}