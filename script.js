let cart = [];
let selectedPaymentMethod = 'paypal';
let discountPercent = 0;
let appliedCouponName = '';

// Production backend hosted on Render.
// Localhost is kept only for local development.
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://nashmimc-bot.onrender.com';

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

    if (cartDrawer) {
        cartDrawer.classList.toggle('active');
    }
}

function toggleNavDrawer() {
    const sideDrawer = document.getElementById('sideDrawer');

    if (sideDrawer) {
        sideDrawer.classList.toggle('active');
    }
}

function toggleColorOptions() {
    const chkColor = document.getElementById('chkColor')?.checked;
    const container = document.getElementById('colorOptionsContainer');

    if (container) {
        container.style.display = chkColor ? 'block' : 'none';
    }

    updateCustomPreview();
}

function toggleGradientMode(isGradient) {
    const secGroup = document.getElementById('secondaryColorGroup');

    if (secGroup) {
        secGroup.style.display = isGradient ? 'block' : 'none';
    }

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

        if (colorHexCodeDisplay) {
            colorHexCodeDisplay.innerText = 'Color Styling: Default (#fbbf24)';
        }

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

        if (colorHexCodeDisplay) {
            colorHexCodeDisplay.innerText = `Gradient HEX: ${pColor} ➔ ${sColor}`;
        }
    } else {
        previewEl.style.background = 'none';
        previewEl.style.color = pColor;
        previewEl.style.webkitBackgroundClip = 'initial';
        previewEl.style.webkitTextFillColor = 'initial';
        previewEl.innerText = `[${nameInput.toUpperCase()}]`;

        if (colorHexCodeDisplay) {
            colorHexCodeDisplay.innerText = `Solid HEX Code: ${pColor}`;
        }
    }

    calcCustomPrice();
}

function calcCustomPrice() {
    let price = 5.00;

    const pv = parseInt(document.getElementById('customPv')?.value) || 0;
    const homes = parseInt(document.getElementById('customHomes')?.value) || 2;
    const ecPrice = parseFloat(document.getElementById('customEc')?.value) || 0;

    price += pv * 3.00;

    if (homes > 2) {
        price += (homes - 2) * 1.50;
    }

    price += ecPrice;

    if (document.getElementById('chkAnvil')?.checked) {
        price += 3.00;
    }

    if (document.getElementById('chkTags')?.checked) {
        price += 4.00;
    }

    if (document.getElementById('chkSafeRoom')?.checked) {
        price += 5.00;
    }

    if (document.getElementById('chkColor')?.checked) {
        price += 3.00;
    }

    const display = document.getElementById('customPriceDisplay');

    if (display) {
        display.innerText = `$${price.toFixed(2)}`;
    }

    return price;
}

function getCustomRankDetails() {
    const rawName = document.getElementById('customName')?.value.trim().toUpperCase() || 'KING';
    const pv = document.getElementById('customPv')?.value || 0;
    const homes = document.getElementById('customHomes')?.value || 2;

    const ecSelect = document.getElementById('customEc');
    const ecText = ecSelect
        ? ecSelect.options[ecSelect.selectedIndex].text
        : 'None';

    const anvil = document.getElementById('chkAnvil')?.checked ? 'Yes' : 'No';
    const tags = document.getElementById('chkTags')?.checked ? 'Yes' : 'No';
    const safeRoom = document.getElementById('chkSafeRoom')?.checked ? 'Yes' : 'No';
    const hasColor = document.getElementById('chkColor')?.checked;

    let colorInfo = 'Default Accent Color';

    if (hasColor) {
        const isGradient =
            document.querySelector('input[name="colorType"]:checked')?.value === 'gradient';

        const pColor =
            document.getElementById('primaryRankColor')?.value || '#ffffff';

        if (isGradient) {
            const sColor =
                document.getElementById('secondaryRankColor')?.value || '#ffffff';

            colorInfo = `Gradient (${pColor} to ${sColor})`;
        } else {
            colorInfo = `Solid (${pColor})`;
        }
    }

    return {
        name: rawName,

        details:
            `Rank Name: [${rawName}] | Color: ${colorInfo} | PVs: ${pv} | Homes: ${homes} | EC: ${ecText} | Anvil: ${anvil} | Tags: ${tags} | SafeRoom: ${safeRoom}`
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
    cart.push({
        title,
        price
    });

    updateCartUI();

    showNotification(
        '<i class="fa-solid fa-cart-plus"></i>',
        'Added to Cart',
        `<strong>${title}</strong> has been added to your shopping cart.`
    );
}

function buyNow(title, price) {
    cart.push({
        title,
        price
    });

    updateCartUI();
    openCheckoutModal();
}

function updateKeyPrice(priceElemId, unitPrice, qty) {
    const total =
        (unitPrice * Math.max(1, parseInt(qty) || 1)).toFixed(2);

    const elem = document.getElementById(priceElemId);

    if (elem) {
        elem.innerText = `$${total}`;
    }
}

function addKeyToCart(keyName, unitPrice, qtyInputId) {
    const qtyInput = document.getElementById(qtyInputId);
    const qty = parseInt(qtyInput?.value) || 1;
    const totalPrice = unitPrice * Math.max(1, qty);

    cart.push({
        title: `${Math.max(1, qty)}x ${keyName}`,
        price: totalPrice
    });

    updateCartUI();

    showNotification(
        '<i class="fa-solid fa-key"></i>',
        'Keys Added',
        `Added ${Math.max(1, qty)}x ${keyName} to your cart.`
    );
}

function buyKeyNow(keyName, unitPrice, qtyInputId) {
    const qtyInput = document.getElementById(qtyInputId);
    const qty = parseInt(qtyInput?.value) || 1;
    const safeQty = Math.max(1, qty);
    const totalPrice = unitPrice * safeQty;

    cart.push({
        title: `${safeQty}x ${keyName}`,
        price: totalPrice
    });

    updateCartUI();
    openCheckoutModal();
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cartTotalDisplay');

    if (!container || !countEl || !totalEl) {
        return;
    }

    container.innerHTML = '';
    countEl.innerText = cart.length;

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemPrice = Number(item.price) || 0;

        subtotal += itemPrice;

        const itemCard = document.createElement('div');
        itemCard.className = 'cart-item-card';

        itemCard.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-title">${item.title}</span>
                <span class="cart-item-price">$${itemPrice.toFixed(2)}</span>
            </div>

            <button
                class="cart-item-remove"
                onclick="removeFromCart(${index})"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        container.appendChild(itemCard);
    });

    const finalTotal =
        subtotal * (1 - discountPercent / 100);

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

    if (couponInput) {
        couponInput.value = '';
    }

    if (msg) {
        msg.innerText = '';
    }

    updateCartUI();
}

function applyCoupon() {
    const code =
        document.getElementById('couponCodeInput')?.value
            .trim()
            .toUpperCase();

    const msg = document.getElementById('couponMsg');

    if (!msg) {
        return;
    }

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
        showNotification(
            '<i class="fa-solid fa-circle-exclamation" style="color:var(--accent)"></i>',
            'Empty Cart',
            'Your shopping cart is empty.'
        );

        return;
    }

    const modal = document.getElementById('checkoutModal');

    if (modal) {
        modal.style.display = 'flex';
    }

    setPaymentMethod(selectedPaymentMethod);
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');

    if (modal) {
        modal.style.display = 'none';
    }
}

function setPaymentMethod(method) {
    selectedPaymentMethod = method;

    const tabPaypal = document.getElementById('tabPaypal');
    const tabCrypto = document.getElementById('tabCrypto');
    const paypalContainer = document.getElementById('paypalContainer');
    const cryptoDetails = document.getElementById('cryptoDetails');

    if (tabPaypal) {
        tabPaypal.classList.toggle('active', method === 'paypal');
    }

    if (tabCrypto) {
        tabCrypto.classList.toggle('active', method === 'crypto');
    }

    if (paypalContainer) {
        paypalContainer.style.display =
            method === 'paypal' ? 'block' : 'none';
    }

    if (cryptoDetails) {
        cryptoDetails.style.display =
            method === 'crypto' ? 'block' : 'none';
    }

    if (method === 'paypal') {
        renderPayPalButtons();
    } else {
        const paypalButtonContainer =
            document.getElementById('paypal-button-container');

        if (paypalButtonContainer) {
            paypalButtonContainer.innerHTML = '';
        }
    }
}

async function apiRequest(path, options = {}) {
    const response =
        await fetch(`${API_URL}${path}`, options);

    let data = null;

    const contentType =
        response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();

        data = text
            ? { message: text }
            : {};
    }

    if (!response.ok) {
        throw new Error(
            data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`
        );
    }

    return data;
}

function getCheckoutCustomer() {
    const ignInput =
        document.getElementById('checkoutIgnInput');

    const discordInput =
        document.getElementById('checkoutDiscordInput');

    const ign =
        ignInput?.value.trim() || '';

    const discordUser =
        discordInput?.value.trim() || '';

    if (!ign) {
        showNotification(
            '<i class="fa-solid fa-triangle-exclamation"></i>',
            'Minecraft Name Required',
            'Please enter your Minecraft In-Game Name (IGN) before continuing.'
        );

        ignInput?.focus();

        return null;
    }

    if (!discordUser) {
        showNotification(
            '<i class="fa-solid fa-triangle-exclamation"></i>',
            'Discord Username Required',
            'Please enter your Discord username before continuing.'
        );

        discordInput?.focus();

        return null;
    }

    return {
        ign,
        discordUser
    };
}

function getCartFinalTotal() {
    const subtotal =
        cart.reduce(
            (sum, item) => sum + Number(item.price || 0),
            0
        );

    return Number(
        (subtotal * (1 - discountPercent / 100))
            .toFixed(2)
    );
}

function readPaymentProof() {
    return new Promise((resolve, reject) => {
        const proofInput =
            document.getElementById('checkoutProofImage');

        const imageFile =
            proofInput?.files?.[0] || null;

        if (!imageFile) {
            resolve(null);
            return;
        }

        const maxSizeBytes = 8 * 1024 * 1024;

        if (imageFile.size > maxSizeBytes) {
            reject(
                new Error(
                    'Payment proof image is too large. Please use an image smaller than 8 MB.'
                )
            );

            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = () => {
            reject(
                new Error(
                    'Unable to read the payment proof image.'
                )
            );
        };

        reader.readAsDataURL(imageFile);
    });
}

function makeClientOrderId() {
    const randomPart =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `NASHMI-${randomPart}`;
}

function setCheckoutBusy(
    isBusy,
    text = 'Complete Payment & Submit Order'
) {
    const submitBtn =
        document.getElementById('submitBtn');

    if (!submitBtn) {
        return;
    }

    submitBtn.disabled = isBusy;

    submitBtn.style.opacity =
        isBusy ? '0.65' : '1';

    submitBtn.style.cursor =
        isBusy ? 'not-allowed' : 'pointer';

    submitBtn.innerHTML = isBusy
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Processing...'
        : `${text} <i class="fa-solid fa-paper-plane"></i>`;
}

function renderPayPalButtons() {
    const container =
        document.getElementById(
            'paypal-button-container'
        );

    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (typeof paypal === 'undefined') {
        container.innerHTML =
            '<p style="color:var(--danger); text-align:center;">PayPal is currently unavailable. Please refresh the page and try again.</p>';

        return;
    }

    if (selectedPaymentMethod !== 'paypal') {
        return;
    }

    paypal.Buttons({

        createOrder: async () => {
            const customer =
                getCheckoutCustomer();

            if (!customer) {
                throw new Error(
                    'Customer information is required.'
                );
            }

            const clientOrderId =
                makeClientOrderId();

            const result =
                await apiRequest(
                    '/api/paypal/create-order',
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body: JSON.stringify({
                            clientOrderId,
                            ign: customer.ign,
                            discordUser:
                                customer.discordUser,
                            items: cart,
                            couponCode:
                                appliedCouponName || null
                        })
                    }
                );

            if (!result.orderID) {
                throw new Error(
                    'PayPal order ID was not returned by the server.'
                );
            }

            window.__nashmiPayPalOrder = {
                paypalOrderId:
                    result.orderID,

                clientOrderId:
                    clientOrderId
            };

            return result.orderID;
        },

        onApprove: async (data) => {
            try {
                const customer =
                    getCheckoutCustomer();

                if (!customer) {
                    throw new Error(
                        'Customer information is required.'
                    );
                }

                const proofImage =
                    await readPaymentProof();

                const clientOrderId =
                    window.__nashmiPayPalOrder
                        ?.clientOrderId ||
                    makeClientOrderId();

                const result =
                    await apiRequest(
                        '/api/paypal/capture-order',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body: JSON.stringify({
                                paypalOrderId:
                                    data.orderID,

                                clientOrderId,

                                ign:
                                    customer.ign,

                                discordUser:
                                    customer.discordUser,

                                items:
                                    cart,

                                couponCode:
                                    appliedCouponName ||
                                    null,

                                imageProof:
                                    proofImage
                            })
                        }
                    );

                const orderId =
                    result.orderId ||
                    clientOrderId;

                const finalTotal =
                    Number(
                        result.total ??
                        getCartFinalTotal()
                    ).toFixed(2);

                finalizeOrderSuccess(
                    orderId,
                    finalTotal
                );

                window.__nashmiPayPalOrder =
                    null;
            } catch (error) {
                console.error(
                    'PayPal payment/capture failed:',
                    error
                );

                showNotification(
                    '<i class="fa-solid fa-circle-exclamation"></i>',
                    'PayPal Payment Error',
                    error.message ||
                    'The PayPal payment could not be completed. Please try again.'
                );
            }
        },

        onError: (error) => {
            console.error(
                'PayPal Buttons Error:',
                error
            );

            showNotification(
                '<i class="fa-solid fa-circle-exclamation"></i>',
                'PayPal Error',
                'PayPal could not complete the payment. Please try again.'
            );
        },

        onCancel: () => {
            showNotification(
                '<i class="fa-solid fa-circle-info"></i>',
                'Payment Cancelled',
                'The PayPal payment was cancelled. Your cart is still available.'
            );
        }

    })
    .render('#paypal-button-container')
    .catch(error => {
        console.error(
            'Failed to render PayPal buttons:',
            error
        );

        container.innerHTML =
            '<p style="color:var(--danger); text-align:center;">Unable to load PayPal buttons. Please refresh the page.</p>';
    });
}

async function processCheckoutWebhook(
    paymentReference = 'Manual/Crypto Pending'
) {
    // PayPal orders are completed by the PayPal buttons themselves.
    if (selectedPaymentMethod === 'paypal') {
        showNotification(
            '<i class="fa-brands fa-paypal"></i>',
            'Complete PayPal Payment',
            'Please complete the PayPal payment using the PayPal button above. Your order will be sent automatically after PayPal confirms the payment.'
        );

        return;
    }

    if (cart.length === 0) {
        showNotification(
            '<i class="fa-solid fa-circle-exclamation"></i>',
            'Empty Cart',
            'Your shopping cart is empty.'
        );

        return;
    }

    const customer =
        getCheckoutCustomer();

    if (!customer) {
        return;
    }

    let imageProof = null;

    try {
        imageProof =
            await readPaymentProof();
    } catch (error) {
        showNotification(
            '<i class="fa-solid fa-triangle-exclamation"></i>',
            'Payment Proof Error',
            error.message
        );

        return;
    }

    if (!imageProof) {
        showNotification(
            '<i class="fa-solid fa-image"></i>',
            'Payment Proof Required',
            'Please attach your payment proof image before submitting a Crypto order.'
        );

        return;
    }

    const orderId =
        makeClientOrderId();

    const finalTotal =
        getCartFinalTotal()
            .toFixed(2);

    const orderData = {
        orderId,

        ign:
            customer.ign,

        discordUser:
            customer.discordUser,

        paymentMethod:
            selectedPaymentMethod
                .toUpperCase(),

        paymentReference,

        total:
            finalTotal,

        items:
            cart,

        date:
            new Date()
                .toLocaleDateString(),

        status:
            'Pending',

        imageProof
    };

    try {
        setCheckoutBusy(true);

        const result =
            await apiRequest(
                '/api/new-order',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            orderData
                        )
                }
            );

        if (!result.success) {
            throw new Error(
                result.error ||
                'The server rejected the order.'
            );
        }

        finalizeOrderSuccess(
            result.orderId ||
                orderId,

            Number(
                result.total ??
                finalTotal
            ).toFixed(2)
        );
    } catch (error) {
        console.error(
            'Crypto order submission failed:',
            error
        );

        showNotification(
            '<i class="fa-solid fa-circle-exclamation"></i>',
            'Order Submission Failed',
            error.message ||
            'The order could not be sent to the server. Please try again.'
        );
    } finally {
        setCheckoutBusy(false);
    }
}

async function sendOrderWithImage(
    orderId,
    ign,
    discordUser,
    finalTotal,
    imageProof
) {
    const orderData = {
        orderId,

        ign,

        discordUser,

        paymentMethod:
            selectedPaymentMethod
                .toUpperCase(),

        total:
            finalTotal,

        items:
            cart,

        date:
            new Date()
                .toLocaleDateString(),

        status:
            'Pending',

        imageProof
    };

    try {
        const result =
            await apiRequest(
                '/api/new-order',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            orderData
                        )
                }
            );

        if (!result.success) {
            throw new Error(
                result.error ||
                'The server rejected the order.'
            );
        }

        finalizeOrderSuccess(
            result.orderId ||
                orderId,

            Number(
                result.total ??
                finalTotal
            ).toFixed(2)
        );
    } catch (error) {
        console.error(
            'Order submission failed:',
            error
        );

        showNotification(
            '<i class="fa-solid fa-circle-exclamation"></i>',
            'Order Submission Failed',
            error.message ||
            'The order could not be sent to the server. Please try again.'
        );
    }
}

function finalizeOrderSuccess(
    orderId,
    finalTotal
) {
    saveOrderToHistory({
        id:
            orderId,

        date:
            new Date()
                .toLocaleDateString(),

        total:
            finalTotal,

        status:
            'Pending',

        items:
            cart
    });

    closeCheckoutModal();
    clearCart();

    showOrderSuccessNotification(
        orderId,

        'Your order details have been successfully sent to Discord.<br>Execution and response time inside the server is within <strong>3 to 4 hours maximum</strong>.'
    );

    switchSection(
        'tracking-section'
    );
}

async function syncOrdersFromServer() {
    const history =
        JSON.parse(
            localStorage.getItem(
                'nashmi_orders'
            ) || '[]'
        );

    if (history.length === 0) {
        return;
    }

    let updated = false;

    await Promise.all(
        history.map(
            async (localOrd) => {
                try {
                    const srvOrd =
                        await apiRequest(
                            `/api/orders/${encodeURIComponent(localOrd.id)}`
                        );

                    if (
                        srvOrd &&
                        srvOrd.status &&
                        srvOrd.status !==
                            localOrd.status
                    ) {
                        localOrd.status =
                            srvOrd.status;

                        updated = true;
                    }
                } catch (error) {
                    // Ignore individual tracking failures.
                }
            }
        )
    );

    if (updated) {
        localStorage.setItem(
            'nashmi_orders',
            JSON.stringify(history)
        );

        renderUserOrders();
    }
}

function showOrderSuccessNotification(
    orderId,
    message
) {
    const icon =
        document.getElementById(
            'notifIcon'
        );

    const titleEl =
        document.getElementById(
            'notifTitle'
        );

    const msg =
        document.getElementById(
            'notifMsg'
        );

    const modal =
        document.getElementById(
            'notificationModal'
        );

    const actionsContainer =
        document.getElementById(
            'notifActions'
        );

    if (icon) {
        icon.innerHTML =
            '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>';
    }

    if (titleEl) {
        titleEl.innerHTML =
            'Order Submitted Successfully!';
    }

    if (msg) {
        msg.innerHTML =
            `Your Order ID: <strong style="color:var(--accent); font-size:1.2rem;">${orderId}</strong><br><br>${message}`;
    }

    if (actionsContainer) {
        actionsContainer.innerHTML = `
            <button
                onclick="copyOrderId('${orderId}')"
                style="
                    background: var(--accent);
                    border: none;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: bold;
                    color: var(--bg-dark);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                "
            >
                <i class="fa-solid fa-copy"></i>
                Copy Order ID
            </button>

            <button
                class="btn-modal-ok"
                onclick="closeNotificationModal()"
                style="
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                "
            >
                OK
            </button>
        `;
    }

    if (modal) {
        modal.style.display = 'flex';
    }
}

function copyOrderId(orderId) {
    navigator.clipboard.writeText(orderId);

    showNotification(
        '<i class="fa-solid fa-copy"></i>',
        'Copied',
        'Order ID copied to clipboard successfully!'
    );
}

function saveOrderToHistory(order) {
    let history =
        JSON.parse(
            localStorage.getItem(
                'nashmi_orders'
            ) || '[]'
        );

    history.unshift(order);

    localStorage.setItem(
        'nashmi_orders',
        JSON.stringify(history)
    );

    renderUserOrders();
}

function renderUserOrders() {
    const container =
        document.getElementById(
            'userOrdersContainer'
        );

    if (!container) {
        return;
    }

    let history =
        JSON.parse(
            localStorage.getItem(
                'nashmi_orders'
            ) || '[]'
        );

    container.innerHTML = '';

    if (history.length === 0) {
        container.innerHTML =
            '<p style="color:var(--text-muted); font-size:0.9rem;">No active orders found on this device.</p>';

        return;
    }

    history.forEach(ord => {
        const itemEl =
            document.createElement('div');

        itemEl.style.cssText =
            'background:var(--bg-dark); border:1px solid var(--border); padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;';

        let statusBadgeClass =
            'status-pending';

        let statusIcon =
            'fa-clock';

        if (
            ord.status === 'Approved' ||
            ord.status === 'مقبول'
        ) {
            statusBadgeClass =
                'status-success';

            statusIcon =
                'fa-check';

            ord.status =
                'Approved';
        } else if (
            ord.status === 'Rejected' ||
            ord.status === 'مرفوض'
        ) {
            statusBadgeClass =
                'status-danger';

            statusIcon =
                'fa-xmark';

            ord.status =
                'Rejected';
        } else {
            ord.status =
                'Pending';
        }

        itemEl.innerHTML = `
            <div>
                <strong style="color:var(--accent); font-size:1rem;">
                    ${ord.id}
                </strong>

                <div
                    style="
                        font-size:0.8rem;
                        color:var(--text-muted);
                        margin-top:4px;
                    "
                >
                    Date: ${ord.date} |
                    Total: $${ord.total}
                </div>
            </div>

            <span class="status-badge ${statusBadgeClass}">
                <i class="fa-solid ${statusIcon}"></i>
                ${ord.status}
            </span>
        `;

        container.appendChild(itemEl);
    });
}

async function trackOrder() {
    const input =
        document.getElementById(
            'trackingInput'
        )?.value.trim();

    const resultBox =
        document.getElementById(
            'trackingResultBox'
        );

    const resultText =
        document.getElementById(
            'trackingResultText'
        );

    if (!input) {
        showNotification(
            '<i class="fa-solid fa-triangle-exclamation"></i>',
            'Track Order',
            'Please enter a valid Order ID.'
        );

        return;
    }

    if (resultBox) {
        resultBox.style.display =
            'block';
    }

    if (resultText) {
        resultText.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Checking order status...';
    }

    try {
        const found =
            await apiRequest(
                `/api/orders/${encodeURIComponent(input)}`
            );

        if (!found || !found.id) {
            throw new Error(
                'Order not found.'
            );
        }

        const items =
            Array.isArray(found.items)
                ? found.items
                : [];

        const itemsStr =
            items.length
                ? items
                    .map(
                        i =>
                            `• ${i.title} ($${Number(i.price || 0).toFixed(2)})`
                    )
                    .join('<br>')
                : 'No item details available.';

        if (resultText) {
            resultText.innerHTML = `
                <strong>Order ID:</strong>
                ${found.id}
                <br>

                <strong>Date:</strong>
                ${found.date || 'N/A'}
                <br>

                <strong>Total:</strong>
                $${Number(found.total || 0).toFixed(2)}
                <br>

                <strong>Status:</strong>
                <span class="status-badge">
                    <i class="fa-solid fa-info-circle"></i>
                    ${found.status || 'Pending'}
                </span>

                <br><br>

                <strong>Items Included:</strong>
                <br>
                ${itemsStr}
            `;
        }

        const history =
            JSON.parse(
                localStorage.getItem(
                    'nashmi_orders'
                ) || '[]'
            );

        const existingIndex =
            history.findIndex(
                o =>
                    o.id.toUpperCase() ===
                    found.id.toUpperCase()
            );

        const compactOrder = {
            id:
                found.id,

            date:
                found.date ||
                new Date()
                    .toLocaleDateString(),

            total:
                Number(
                    found.total || 0
                ).toFixed(2),

            status:
                found.status ||
                'Pending',

            items
        };

        if (existingIndex >= 0) {
            history[existingIndex] =
                compactOrder;
        } else {
            history.unshift(
                compactOrder
            );
        }

        localStorage.setItem(
            'nashmi_orders',
            JSON.stringify(history)
        );

        renderUserOrders();

    } catch (error) {
        if (resultText) {
            resultText.innerHTML =
                `<strong>Order ID:</strong> ${input}<br><strong>Status:</strong> Not Found`;
        }
    }
}

function copyHomeServerIp() {
    navigator.clipboard.writeText(
        'play.nashmimc.net'
    );

    showNotification(
        '<i class="fa-solid fa-copy"></i>',
        'IP Copied',
        'Server IP copied to clipboard!'
    );
}

function copyServerIp() {
    copyHomeServerIp();
}

function copyWallet() {
    const addr =
        document.getElementById(
            'walletAddr'
        )?.innerText || '';

    navigator.clipboard.writeText(addr);

    showNotification(
        '<i class="fa-solid fa-copy"></i>',
        'Wallet Copied',
        'Binance TRC20 Wallet Address copied!'
    );
}

function showNotification(
    iconHtml,
    title,
    message
) {
    const icon =
        document.getElementById(
            'notifIcon'
        );

    const titleEl =
        document.getElementById(
            'notifTitle'
        );

    const msg =
        document.getElementById(
            'notifMsg'
        );

    const modal =
        document.getElementById(
            'notificationModal'
        );

    const actionsContainer =
        document.getElementById(
            'notifActions'
        );

    if (icon) {
        icon.innerHTML =
            iconHtml;
    }

    if (titleEl) {
        titleEl.innerHTML =
            title;
    }

    if (msg) {
        msg.innerHTML =
            message;
    }

    if (actionsContainer) {
        actionsContainer.innerHTML = `
            <button
                class="btn-modal-ok"
                onclick="closeNotificationModal()"
                style="
                    padding: 10px 22px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                "
            >
                OK
            </button>
        `;
    }

    if (modal) {
        modal.style.display =
            'flex';
    }
}

function closeNotificationModal() {
    const modal =
        document.getElementById(
            'notificationModal'
        );

    if (modal) {
        modal.style.display =
            'none';
    }
}
