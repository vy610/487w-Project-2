const firebaseConfig = {
    apiKey: "AIzaSyCGPRkxuSoUJaq2wtYuMfqeslDMA3dF7cw",
    authDomain: "w-2efa5.firebaseapp.com",
    projectId: "w-2efa5",
    storageBucket: "w-2efa5.appspot.com",
    messagingSenderId: "716692322077",
    appId: "1:716692322077:web:426ef145c126e5866d53f4",
    measurementId: "G-92EXLVV5EK"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const myStuff = firestore.collection('Stuff');

myStuff.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
    });
}).catch((error) => {
    console.error("Error getting documents: ", error);
});

const itemContainer = document.getElementById("itemContainer");
document.addEventListener("DOMContentLoaded", function() {
    myStuff.get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const itemData = doc.data();
                const itemDiv = document.createElement("div");
                itemDiv.className = "item";
                itemDiv.id = doc.id;

                itemDiv.innerHTML = `
                    <h2>${itemData.name}</h2>
                    <img src="${itemData.image}" />
                    <span>ID: ${doc.id}</span>
                    <p>Description: ${itemData.description}</p>
                    <span>Price: $${itemData.price}</span>
                `;

                itemContainer.appendChild(itemDiv);
            });
        })
        .catch((error) => {
            console.error("Error getting items: ", error);
        });
});

const addItemForm = document.getElementById("itemForm");
addItemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let itemName = document.getElementById("name").value;
    let itemPrice = document.getElementById("price").value;
    let itemDescription = document.getElementById("description").value;
    let itemImage = document.getElementById("image").value;

    console.log(itemName);
    console.log(itemPrice);
    console.log(itemDescription);
    console.log(itemImage);

    const storeItemData = {
        name: itemName,
        price: itemPrice,
        description: itemDescription,
        image: itemImage,
    };

    myStuff.add(storeItemData)
        .then((docRef) => {
            return docRef.get();
        })
        .then((doc) => {
            const itemData = doc.data();
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";
            itemDiv.innerHTML = `
                <h2>${itemData.name}</h2>
                <img src="${itemData.image}" />
                <span>ID: ${doc.id}</span>
                <p>Description: ${itemData.description}</p>
                <span>Price: $${itemData.price}</span>
            `;
            itemContainer.appendChild(itemDiv);
        })
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
});

const removeItemForm = document.getElementById("itemRemove");
removeItemForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const itemId = document.getElementById("id").value;

    try {
        const querySnapshot = await myStuff.where(firebase.firestore.FieldPath.documentId(), '==', itemId).get();
        const deletionPromises = querySnapshot.docs.map(async (doc) => {
            await myStuff.doc(doc.id).delete();
            const itemToRemove = document.getElementById(doc.id);
            console.log('ID from Firestore:', doc.id);
            console.log('Item to remove:', itemToRemove);
            console.log('Document HTML:', document.documentElement.innerHTML);
            if (itemToRemove) {
                itemToRemove.remove();
                console.log("Successfully deleted");
            } else {
                console.log("Element not found in DOM");
            }
        });

        // Wait for all deletion promises to complete
        await Promise.all(deletionPromises);
    } catch (error) {
        console.error("Error deleting item:", error);
    }
});

const itemEditForm = document.getElementById("itemEdit");
itemEditForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let itemId = document.getElementById("editItem").value;
    let itemPrice = parseFloat(document.getElementById("editPrice").value);
    let itemName = document.getElementById("editName").value;
    let itemDescription = document.getElementById("editDescription").value;
    let itemImage = document.getElementById("editImage").value;

    let existingItemDiv = document.getElementById(itemId);
    let existingItemName = existingItemDiv.querySelector("h2").textContent;
    let existingItemDescription = existingItemDiv.querySelector("p").textContent.replace("Description: ", "");
    let existingItemImage = existingItemDiv.querySelector("img").getAttribute('src');  // Using getAttribute
    let existingItemPrice = parseFloat(existingItemDiv.querySelector("span").textContent.replace("$", ""));

    if (!itemName.trim()) {
        itemName = existingItemName;
    }
    if (!itemDescription.trim()) {
        itemDescription = existingItemDescription;
    }
    if (!itemImage.trim()) {
        itemImage = existingItemImage;
    }
    if (isNaN(itemPrice)) {
        itemPrice = existingItemPrice;
    }

    const storeItemData = {
        name: itemName,
        price: itemPrice,
        description: itemDescription,
        image: itemImage,
    }

    let editMessage = document.getElementById("editMessage");

    myStuff.where(firebase.firestore.FieldPath.documentId(), '==', itemId).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                console.log("No matching document found");
                editMessage.textContent = "No matching id found";
            } else {
                querySnapshot.forEach((doc) => {
                    myStuff.doc(itemId).update(storeItemData)
                        .then(() => {
                            const itemToUpdate = document.getElementById(doc.id);
                            if (itemToUpdate) {
                                itemToUpdate.innerHTML = `
                                    <h2>${storeItemData.name}</h2>
                                    <img src="${storeItemData.image}" />
                                    <span>ID: ${doc.id}</span>
                                    <p>Description: ${storeItemData.description}</p>
                                    <span>Price: $${storeItemData.price}</span>
                                `;
                            }
                            console.log("Successfully edited");
                            editMessage.textContent = "Successfully edited";
                        })
                        .catch((error) => {
                            console.error("Error editing item", error);
                            editMessage.textContent = "Error editing item: " + error.message;
                        });
                });
            }
        })
        .catch((error) => {
            console.error("Error querying Firestore: ", error);
        });
});

const searchResults = document.getElementById("search");
const searchItemForm = document.getElementById("searchItem");

if (searchItemForm) {
    searchItemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        itemContainer.innerHTML = "";
        const query = searchResults.value.toLowerCase();
        console.log('Form submitted with query:', query);

        myStuff.doc(query).get().then((doc) => {
            console.log('Document fetch attempted.');
            if (doc.exists) {
                console.log('Document exists:', doc.data());
                const itemData = doc.data();
                const itemDiv = document.createElement("div");
                itemDiv.className = "item";

                itemDiv.innerHTML = `
                  <h2>${itemData.name}</h2>
                  <img src="${itemData.image}" />
                  <span>ID: ${doc.id}</span>
                  <p>Description: ${itemData.description}</p>
                  <span>Price: $${itemData.price}</span>
                `;

                itemContainer.appendChild(itemDiv);
            }
        }).catch((error) => {
            console.error("Error getting document by ID:", error);
        });

        myStuff.get()
            .then((querySnapshot) => {
                console.log('Name based query attempted.');
                querySnapshot.forEach((doc) => {
                    const itemData = doc.data();
                    const itemName = itemData.name.toLowerCase();
                    if (itemName.includes(query)) {
                        const itemDiv = document.createElement("div");
                        itemDiv.className = "item";
                        itemDiv.innerHTML = `
                          <h2>${itemData.name}</h2>
                          <img src="${itemData.image}" />
                          <span>ID: ${doc.id}</span>
                          <p>Description: ${itemData.description}</p>
                          <span>Price: $${itemData.price}</span>
                        `;

                        itemContainer.appendChild(itemDiv);
                    }
                });
            }).catch((error) => {
            console.error("Error getting documents: ", error);
        });

    });
}

const alphabeticalOrderForm = document.getElementById("alphabeticalOrderForm")
if (alphabeticalOrderForm) {
    alphabeticalOrderForm.addEventListener("submit", (e) => {
        e.preventDefault();

        itemContainer.innerHTML = "";

        myStuff.get()
            .then((querySnapshot) => {
                const itemsArray = [];
                querySnapshot.forEach((doc) => {
                    itemsArray.push({ id: doc.id, ...doc.data() });
                });

                // Sort itemsArray based on the 'name' field
                itemsArray.sort((a, b) => a.name.localeCompare(b.name));

                itemsArray.forEach((itemData) => {
                    const itemDiv = document.createElement("div");
                    itemDiv.className = "item";
                    itemDiv.id = itemData.id;

                    itemDiv.innerHTML = `
                    <h2>${itemData.name}</h2>
                    <img src="${itemData.image}" />
                    <span>ID: ${itemData.id}</span>
                    <p>Description: ${itemData.description}</p>
                    <span>Price: $${itemData.price}</span>
                    
                  `;
                    itemContainer.appendChild(itemDiv);
                });
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
            });
    });
}

const alphabeticalOrderIdForm = document.getElementById("alphabeticalId")
if (alphabeticalOrderIdForm) {
    alphabeticalOrderIdForm.addEventListener("submit", (e) => {
        e.preventDefault();

        itemContainer.innerHTML = "";

        myStuff.get()
            .then((querySnapshot) => {
                const itemsArray = [];
                querySnapshot.forEach((doc) => {
                    itemsArray.push({ id: doc.id, ...doc.data() });
                });

                itemsArray.sort((a, b) => a.id.localeCompare(b.id));

                itemsArray.forEach((itemData) => {
                    const itemDiv = document.createElement("div");
                    itemDiv.className = "item";
                    itemDiv.id = itemData.id;

                    itemDiv.innerHTML = `
                    <h2>${itemData.name}</h2>
                    <img src="${itemData.image}" />
                    <span>ID: ${itemData.id}</span>
                    <p>Description: ${itemData.description}</p>
                    <span>Price: $${itemData.price}</span>
                  `;
                    itemContainer.appendChild(itemDiv);
                });
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
            });
    });
}
const resetSearchForm = document.getElementById("resetSearch")
if (resetSearchForm) {
    resetSearchForm.addEventListener("submit", (e) => {
        e.preventDefault();

        itemContainer.innerHTML = "";

        myStuff.get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const itemData = doc.data();
                    const itemDiv = document.createElement("div");
                    itemDiv.className = "item";
                    itemDiv.id = doc.id;

                    itemDiv.innerHTML = `
                    <h2>${itemData.name}</h2>
                    <img src="${itemData.image}" />
                    <span>ID: ${doc.id}</span>
                    <p>Description: ${itemData.description}</p>
                    <span>Price: $${itemData.price}</span>
                `;

                    itemContainer.appendChild(itemDiv);
                });
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
            });
    });
}



