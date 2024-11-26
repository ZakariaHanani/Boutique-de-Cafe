// Lancer l'application quand le DOM est chargé
document.addEventListener('onload', getProducts());
var products=[] ;
//Question 2 : 
// récupérer les données des produits depuis l'API
function getProducts(){
    fetch("https://fake-coffee-api.vercel.app/api") 
    .then((res) => res.json()) 
    .then((data) => {
        products =data ;
        addProductsToDb(data);
        displayProducts(data)})
    .catch((error) => {
            console.error("Erreur lors de la récupération des produits :", error);
            loadProductsFromDB();
        });

}

//Question 3 : 

function createProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card')
    card.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}">
    <h3>${product.name}</h3>
    <div class ="product-info">
    <h4 class="price">${product.price}</h4>
    <p class="description">${product.description}</p>
    <button class="add-to-cart" onclick="addToCart(${product.id})">+</button>`;
    return card;
}
function displayProducts(products) {
    const productContainer =document.getElementById("product-content");
    productContainer.innerHTML="";
    products.forEach(product => {
        const productCard = createProductCard(product);
        productContainer.appendChild(productCard);
    });
}

function addToCart(productId) {
    let dbReq = openDB();

    dbReq.onsuccess = () => {
        const db = dbReq.result;

        // Vérifiez si le magasin existe
        if (!db.objectStoreNames.contains("cart")) {
            console.error("Erreur : le magasin 'cart' n'existe pas.");
            return;
        }

        const transaction = db.transaction("cart", "readwrite");
        const store = transaction.objectStore("cart");

        // Trouver le produit correspondant dans la variable globale products
        const productDetail = products.find((p) => p.id == productId);

        if (!productDetail) {
            console.error("Produit introuvable dans la liste globale.");
            return;
        }

        const cartItem = {
            id: productDetail.id,
            name: productDetail.name,
            price: productDetail.price,
            image_url: productDetail.image_url,
            quantity: 1,
        };

        store.put(cartItem);

        transaction.oncomplete = () => {
            console.log("Produit ajouté au panier");
        };

        transaction.onerror = (event) => {
            console.error("Erreur lors de l'ajout au panier :", event.target.error);
        };
    };

    dbReq.onerror = () => {
        console.error("Erreur lors de l'ouverture de la base de données");
    };
}




//Question 4 :
// Mode view
// Ajouter les écouteurs d'événements aux icônes




// Fonction pour passer en vue grille
// Fonction pour passer en vue grille
function setGridView() {
    document.getElementById('product-content').style.flexDirection ='row' ;
    document.getElementById('product-content').style.justifyContent='center'

    document.querySelectorAll('.product-card').forEach(card => {
        // Reset styles for grid view
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.width = 'min-content'; // Restrict card width
        card.style.margin = '5px'; // Add spacing between cards
    });


    document.querySelectorAll('.product-card img').forEach(img => {
        img.style.maxWidth = '300px'; // Ensure the image fits within the card
        img.style.marginBottom = '10px'; // Add spacing below the image
    });

    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.style.alignSelf = 'center'; // Center-align buttons in grid view
    });
}

// Fonction pour passer en vue liste
function setListView() {
    document.getElementById('product-content').style.flexDirection ='column' ;
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.alignItems = 'center';
        card.style.width = '100%'; // Full width for list view
        card.style.margin = '10px 0'; // Add vertical spacing between cards
    });

    document.querySelectorAll('.product-card img').forEach(img => {
        img.style.maxWidth = '200px'; // Set a fixed width for list view
        img.style.marginRight = '20px'; // Add spacing to the right of the image
    });

    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.style.alignSelf = 'flex-end'; // Align buttons to the end in list view
        btn.style.marginLeft = 'auto'; // Push the button to the right in the flex container
    });
}


// Ajouter les écouteurs d'événements aux icônes

document.getElementById('grid').addEventListener('click', setGridView);
document.getElementById('list').addEventListener('click', setListView);

// Initialiser la vue par défaut (grille)

setGridView();


// Fonction pour filtrer les produits
function filterProducts() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        (product.description && product.description.toLowerCase().includes(keyword))
    );
    displayProducts(filteredProducts);
    if (!keyword) {
        displayProducts(products); // Display all products if no input
        return;
    }
}

// Écouteur d'événement pour le champ de recherche
document.getElementById('search-input').addEventListener('input', () => {
    console.log("Input event fired!");
    filterProducts();
});

function openDB() {
    let openRequest = indexedDB.open("db", 3);

    openRequest.onupgradeneeded = () => {
        const db = openRequest.result;

        if (!db.objectStoreNames.contains("product")) {
            db.createObjectStore("product", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cart")) {
            db.createObjectStore("cart", { keyPath: "id" });
        }
    };

    openRequest.onerror = (event) => {
        console.error("Erreur d'ouverture de la base de données :", event.target.error);
    };

    return openRequest;
}


function addProductsToDb(products){
let dbRequest = openDB();
dbRequest.onsuccess = function() { 
    var db = dbRequest.result;
    let transaction = db.transaction("product", "readwrite"); // (1)
    let store = transaction.objectStore("product"); // (2)
    products.forEach(product =>{
      store.add(product);  // (3)
    }) ;
    transaction.oncomplete = () => {
        console.log("Produits stockés avec succès");
    };
    };
dbRequest.onerror = (event) => {  
        console.log("Erreur d'ouverture de la base de données :", event.target.error); 
    };
}

function loadProductsFromDB(){
    let openRequest = openDB();

// get an object store to operate on it
    openRequest.onsuccess = function() { 
        var db = openRequest.result;
        let transaction = db.transaction("product", "readonly"); // (1)
        let store = transaction.objectStore("product"); // (2)
        let request = store.getAll();  // (3)
        request.onsuccess= function(){
            products =request.result ;
            displayProducts(products);
        }
        request.onerror= function(){
            console.log("Erreur lors du chargement des produits depuis IndexedDB.")
        }
        openRequest.onerror =(event)=>{
            console.error("Erreur d'ouverture de la base de données :", event.target.error);
        }
    } 
}