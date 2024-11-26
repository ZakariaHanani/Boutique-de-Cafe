// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', loadProductsFromCart());

// TODO: Déclarer la variable total pour stocker le montant total du panier
let total = 0;




// ================ initialise et ouvre la connexion à la base de données IndexedDB ================
/**
 * Ouvre ou crée la base de données IndexedDB
 * return La requête d'ouverture de la base de données
 */
function openDB() {
    // TODO: Implémenter l'ouverture de la base de données
    // 1. Créer une requête d'ouverture de la base "CoffeeShopDB" version 1
    // 2. Gérer l'événement onupgradeneeded pour créer:
    //    - Un objectStore "products" avec keyPath "id"
    //    - Un objectStore "cart" avec keyPath "id"
    // 3. Retourner la requête

    let openDb =indexedDB.open("db",3) ;

    openDb.onupgradeneeded = () =>{
        var db =openDb.result;
        if (!db.objectStoreNames.contains('product')) 
        { 
          db.createObjectStore('product', {keyPath: 'id'}); 
        }
        if (!db.objectStoreNames.contains('cart')) 
        { 
          db.createObjectStore('cart', {keyPath: 'id'}); 
        }
       
    }
     return openDb ;
    
}


// ================ CHARGEMENT DU PANIER ================
/**
 * Charge les produits du panier depuis IndexedDB et les affiche
 */
function loadProductsFromCart() {
    
    const dbRequest = openDB();

    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction('cart', 'readonly');
        const store = transaction.objectStore('cart');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
            const products = getAllRequest.result;
            displayCartItem(products);
        };

        getAllRequest.onerror = () => {
            console.error("Erreur lors du chargement des produits du panier.");
        };
    };

    dbRequest.onerror = () => {
        console.error("Erreur d'ouverture de la base de données.");
    };
 }

// ================ AFFICHAGE DU PANIER ================
/**
 * Affiche les produits du panier dans l'interface
 */
function displayCartItem(products) {
   

        total = 0; // Réinitialiser le total
        const cartContainer = document.getElementById('cart-items');
        cartContainer.innerHTML = ''; // Vider le conteneur
    
        products.forEach((product) => {
            const row = createCartItemRow(product);
            cartContainer.appendChild(row);
            total += product.price * product.quantity; // Mise à jour dua total
           
        });
        const cartTotalElement = document.getElementById('cart-total');
            if (cartTotalElement) {
                cartTotalElement.innerText = `Total: ${total.toFixed(2)} €`;
            } else {
                console.error("L'élément avec l'ID 'cart-total' est introuvable.");
            }


    }
    



/**
 * Crée une ligne pour un produit dans le panier
 * param {Object} item - Le produit à afficher
 * return {HTMLElement} La ligne créée
 */
function createCartItemRow(item) {
    const template = document.getElementById('cart-item-template');
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector('.cart-item');

    // Remplissage des données
    row.querySelector('img').src = item.image || 'https://via.placeholder.com/150';
    row.querySelector('.product-name').textContent = item.name;
    row.querySelector('.product-price').textContent = `${item.price.toFixed(2)} €`;
    row.querySelector('.quantity').textContent = item.quantity;
    row.querySelector('.item-total').textContent = `${(item.price * item.quantity).toFixed(2)} €`;

    // Événements
    row.querySelector('.decrease-btn').addEventListener('click', () => updateQuantity(item.id, item.quantity - 1));
    row.querySelector('.increase-btn').addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));
    row.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(item.id));

    return row;
}


// ================ GESTION DES PRODUITS DU PANIER ================
/**
 * Met à jour la quantité d'un produit dans le panier
 * param {string} productId - ID du produit à modifier
 * param {number} newQuantity - Nouvelle quantité
 */
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    const dbRequest = openDB();
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction('cart', 'readwrite');
        const store = transaction.objectStore('cart');
        const itemRequest = store.get(productId);
        itemRequest.onsuccess = () => {
            const product = itemRequest.result;
            product.quantity = newQuantity;
            store.put(product);
        };
        transaction.oncomplete = () => {
            loadProductsFromCart();
        };
    };
    dbRequest.onerror = () => {
        console.error("Erreur d'ouverture de la base de données.");
    };
}


/**
 * Supprime un produit du panier
 * param {string} productId - ID du produit à supprimer
 */
function removeFromCart(productId) {
    const dbRequest = openDB();
    dbRequest.onsuccess = () => {
        const db = dbRequest.result;
        const transaction = db.transaction('cart', 'readwrite');
        const store = transaction.objectStore('cart');

        store.delete(productId);

        transaction.oncomplete = () => {
            loadProductsFromCart();
        };
    };

    dbRequest.onerror = () => {
        console.error("Erreur d'ouverture de la base de données.");
    };
}






