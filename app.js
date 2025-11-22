// Wait for the HTML document to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const productCatalogDiv = document.getElementById('product-catalog');

    // Function to generate and display product cards in the HTML
    const renderProducts = (products) => {
        // If there are no products, show a message
        if (!products || products.length === 0) {
            productCatalogDiv.innerHTML = '<p>No products are available for your region at this time.</p>';
            return;
        }

        // Build the HTML for each product card
        const productsHTML = products.map(product => `
            <div class="col-lg-4 col-md-6">
                <div class="card product-card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted">${product.description}</p>
                        <p class="product-price text-primary">${product.price}</p>
                        <a href="${product.buy_url}" class="btn btn-success w-100" target="_blank" rel="noopener noreferrer">Buy Now</a>
                    </div>
                </div>
            </div>
        `).join(''); // Join all card HTML strings into one

        // Replace the "Loading..." message with the product cards
        productCatalogDiv.innerHTML = productsHTML;
    };

    // Main function to get location and load the appropriate products
    const loadProductsByLocation = async () => {
        try {
            // 1. Fetch all product catalogs from our JSON file
            const productsResponse = await fetch('products.json');
            if (!productsResponse.ok) throw new Error('Failed to load product data.');
            const allCatalogs = await productsResponse.json();

            // 2. Fetch user's location from a free IP Geolocation API
            const locationResponse = await fetch('https://ipapi.co/json/?key=YOUR_API_KEY'); // Replace with your key if you have one
            if (!locationResponse.ok) throw new Error('Failed to determine location.');
            const locationData = await locationResponse.json();

            const country = locationData.country_code; // e.g., "IN", "CA", "FR", "US"
            console.log(`User detected in country: ${country}`);

            // 3. Determine which catalog to use
            // If a catalog for the user's country exists, use it. Otherwise, use the 'default' catalog.
            const finalProducts = allCatalogs[country] || allCatalogs.default;
            
            // 4. Render the chosen products on the page
            renderProducts(finalProducts);

        } catch (error) {
            console.error('Error:', error);
            // If anything fails, show an error message and try to load the default catalog as a fallback
            productCatalogDiv.innerHTML = `<p>Sorry, we had trouble loading products for your region. Showing our global catalog.</p>`;
            try {
                const productsResponse = await fetch('products.json');
                const allCatalogs = await productsResponse.json();
                renderProducts(allCatalogs.default);
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError);
                productCatalogDiv.innerHTML = '<p>We are currently unable to display our products. Please check back later.</p>';
            }
        }
    };

    // Start the entire process
    loadProductsByLocation();
});