// Catalogue des montres disponibles
const montres = {
    'heritage-1950': {
        titre: 'Chronographe "Héritage 1950"',
        marque: 'Manufacture Royale',
        prix: 24500,
        description: 'Un boîtier en or rose 18 carats abritant un mouvement mécanique à remontage manuel.'
    },
    'abyssale-gmt': {
        titre: 'L\'Abyssale GMT',
        marque: 'Nautilus Tech',
        prix: 12800,
        description: 'La montre de plongée ultime. Titane grade 5 et lunette en céramique inrayable.'
    }
};

// Initialiser la collection depuis le localStorage
let collection = JSON.parse(localStorage.getItem('collection')) || [];

// Initialiser les écouteurs d'événements au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
    attacherEvenementsBoutons();
    afficherCollection();
});

// Attacher les événements click aux boutons
function attacherEvenementsBoutons() {
    const boutons = document.querySelectorAll('button[type="button"]');
    
    boutons.forEach((bouton, index) => {
        bouton.addEventListener('click', function() {
            const article = bouton.closest('article');
            const titre = article.querySelector('h3').textContent;
            const prixText = article.querySelector('p:last-of-type').textContent;
            const prix = parseInt(prixText.match(/\d+/)[0]);
            
            ajouterACollection(titre, prix);
        });
    });
}

// Ajouter une montre à la collection
function ajouterACollection(titre, prix) {
    // Créer un ID unique basé sur le titre
    const id = titre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Vérifier si la montre est déjà dans la collection
    const existe = collection.some(item => item.id === id);
    
    if (existe) {
        // Incrémenter la quantité si elle existe déjà
        const item = collection.find(item => item.id === id);
        item.quantite++;
    } else {
        // Ajouter une nouvelle montre
        collection.push({
            id: id,
            titre: titre,
            prix: prix,
            quantite: 1
        });
    }
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('collection', JSON.stringify(collection));
    
    // Mettre à jour l'affichage
    afficherCollection();
    
    // Feedback visuel
    alert(`${titre} a été ajoutée à votre collection!`);
}

// Afficher la collection
function afficherCollection() {
    // Créer la section de collection si elle n'existe pas
    let sectionCollection = document.getElementById('ma-collection');
    
    if (!sectionCollection) {
        sectionCollection = document.createElement('section');
        sectionCollection.id = 'ma-collection';
        
        // Insérer la section après la première hr
        const premiereHr = document.querySelector('hr');
        premiereHr.parentNode.insertBefore(sectionCollection, premiereHr.nextSibling);
    }
    
    if (collection.length === 0) {
        sectionCollection.innerHTML = `
            <h2>Ma Collection</h2>
            <p style="color: #999;">Votre collection est vide. Explorez nos montres d'exception!</p>
        `;
        return;
    }
    
    let html = `
        <h2>Ma Collection (${collection.length} montre(s) - ${calculerTotal()} €)</h2>
        <div class="collection-container">
    `;
    
    collection.forEach(item => {
        html += `
            <div class="collection-item">
                <h4>${item.titre}</h4>
                <p><strong>Prix unitaire:</strong> ${item.prix} €</p>
                <p><strong>Quantité:</strong> 
                    <button class="btn-quantite" data-id="${item.id}" data-action="moins">−</button>
                    ${item.quantite}
                    <button class="btn-quantite" data-id="${item.id}" data-action="plus">+</button>
                </p>
                <p><strong>Sous-total:</strong> ${item.prix * item.quantite} €</p>
                <button class="btn-supprimer" data-id="${item.id}">Supprimer</button>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="collection-actions">
            <p><strong>Total:</strong> ${calculerTotal()} €</p>
            <button id="btn-vider" class="btn-action">Vider la collection</button>
            <button id="btn-commander" class="btn-action btn-commander">Passer la commande</button>
        </div>
    `;
    
    sectionCollection.innerHTML = html;
    
    // Attacher les événements aux boutons
    document.querySelectorAll('.btn-quantite').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const action = this.dataset.action;
            modifierQuantite(id, action);
        });
    });
    
    document.querySelectorAll('.btn-supprimer').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            supprimerDeLaCollection(id);
        });
    });
    
    const btnVider = document.getElementById('btn-vider');
    if (btnVider) {
        btnVider.addEventListener('click', viderCollection);
    }
    
    const btnCommander = document.getElementById('btn-commander');
    if (btnCommander) {
        btnCommander.addEventListener('click', passerCommande);
    }
}

// Calculer le total
function calculerTotal() {
    return collection.reduce((total, item) => total + (item.prix * item.quantite), 0);
}

// Modifier la quantité
function modifierQuantite(id, action) {
    const item = collection.find(i => i.id === id);
    if (item) {
        if (action === 'plus') {
            item.quantite++;
        } else if (action === 'moins' && item.quantite > 1) {
            item.quantite--;
        } else if (action === 'moins' && item.quantite === 1) {
            supprimerDeLaCollection(id);
            return;
        }
        localStorage.setItem('collection', JSON.stringify(collection));
        afficherCollection();
    }
}

// Supprimer de la collection
function supprimerDeLaCollection(id) {
    collection = collection.filter(item => item.id !== id);
    localStorage.setItem('collection', JSON.stringify(collection));
    afficherCollection();
}

// Vider toute la collection
function viderCollection() {
    if (confirm('Êtes-vous sûr de vouloir vider votre collection?')) {
        collection = [];
        localStorage.setItem('collection', JSON.stringify(collection));
        afficherCollection();
    }
}

// Passer une commande
function passerCommande() {
    if (collection.length === 0) {
        alert('Votre collection est vide!');
        return;
    }
    
    const total = calculerTotal();
    const resume = collection.map(item => `- ${item.titre}: ${item.quantite} x ${item.prix}€`).join('\n');
    
    alert(`Résumé de votre commande:\n\n${resume}\n\nTotal: ${total}€\n\nRedirection vers le paiement...`);
    
    // Rediriger vers la section contact pour remplir le formulaire
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}
