const firebaseConfig = {
    apiKey: "AIzaSyAQuOpN56IpmKYQnG1C1GKQaetJq_6MeP4",
    authDomain: "baogiasp-e3a97.firebaseapp.com",
    databaseURL: "https://baogiasp-e3a97-default-rtdb.firebaseio.com",
    projectId: "baogiasp-e3a97",
    storageBucket: "baogiasp-e3a97.firebasestorage.app",
    messagingSenderId: "524060010006",
    appId: "1:524060010006:web:2999abb93c0369e27ab737",
    measurementId: "G-HKVPB99NXJ"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();


document.addEventListener('DOMContentLoaded', function () {
    const products = [];
    const productList = document.getElementById('productList');
    const addProductButton = document.getElementById('addProductButton');
    const searchBar = document.getElementById('searchBar');
    const variantContainer = document.getElementById('variantContainer');
    const uploadExcel = document.getElementById('uploadExcel');
    const importButton = document.getElementById('importButton');
    const productsPerPage = 6;
    let currentPage = 1;

    // Tạo input cho danh mục khác
    const otherCategoryInput = document.createElement('input');
    otherCategoryInput.type = 'text';
    otherCategoryInput.id = 'otherCategoryInput';
    otherCategoryInput.placeholder = 'Nhập danh mục khác';
    otherCategoryInput.style.display = 'none';
    otherCategoryInput.style.marginTop = '10px';
    otherCategoryInput.style.padding = '8px';
    otherCategoryInput.style.borderRadius = '4px';
    otherCategoryInput.style.border = '1px solid #ddd';
    otherCategoryInput.style.width = '100%';
    otherCategoryInput.style.boxSizing = 'border-box';

    // Thêm option "Khác" vào select
    const categorySelect = document.getElementById('productCategory');
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Khác';
    categorySelect.appendChild(otherOption);

    // Thêm input vào sau select
    categorySelect.parentNode.insertBefore(otherCategoryInput, categorySelect.nextSibling);

    // Thêm event listener cho select
    categorySelect.addEventListener('change', toggleOtherCategory);

    function toggleOtherCategory() {
        const categorySelect = document.getElementById('productCategory');
        const otherCategoryInput = document.getElementById('otherCategoryInput');
        
        if (categorySelect.value === 'other') {
            otherCategoryInput.style.display = 'block';
        } else {
            otherCategoryInput.style.display = 'none';
            otherCategoryInput.value = '';
        }
    }

    function addProduct() {
        const productName = document.getElementById('productName').value.trim();
        const categorySelect = document.getElementById('productCategory');
        const otherCategoryInput = document.getElementById('otherCategoryInput');
        
        let productCategory;
        if (categorySelect.value === 'other') {
            productCategory = otherCategoryInput.value.trim();
            if (!productCategory) {
                alert('Vui lòng nhập danh mục khác.');
                return;
            }
        } else {
            productCategory = categorySelect.value.trim();
        }

        if (!productName || !productCategory) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        const variantInputs = variantContainer.querySelectorAll('.variant-input');
        const variants = [];
        variantInputs.forEach(input => {
            const variant = input.value.trim();
            if (variant) {
                variants.push(variant);
            }
        });

        // Thêm sản phẩm vào Firebase
        const newProductRef = database.ref('products').push();
        newProductRef.set({
            name: productName,
            category: productCategory,
            variants: variants
        });

        resetForm();
    }

    function renderProductList() {
        productList.innerHTML = '';
        const searchText = searchBar.value.trim().toLowerCase();
        const filteredProducts = products.filter(product => {
            return product.name.toLowerCase().includes(searchText);
        });
    
        if (filteredProducts.length === 0) {
            productList.innerHTML = '<p class="no-products">Không có sản phẩm nào!</p>';
            updatePagination(0);
            return;
        }
    
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
    
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
    
        for (let i = startIndex; i < endIndex; i++) {
            const product = filteredProducts[i];
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
    
            const title = document.createElement('h3');
            title.textContent = product.name;
            productDiv.appendChild(title);
    
            const detailButton = document.createElement('button');
            detailButton.textContent = 'Chi tiết';
            detailButton.classList.add('detail-button');
            detailButton.addEventListener('click', () => {
                const detailsDiv = productDiv.querySelector('.product-details');
                if (detailsDiv) {
                    detailsDiv.style.display = detailsDiv.style.display === 'none' ? 'block' : 'none';
                } else {
                    const newDetailsDiv = document.createElement('div');
                    newDetailsDiv.classList.add('product-details');
                    newDetailsDiv.style.display = 'block';
                    newDetailsDiv.textContent = product.variants.join(', ') || 'Không có phân loại';
                    productDiv.appendChild(newDetailsDiv);
                }
            });
    
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Xóa';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                // Xóa sản phẩm khỏi Firebase
                database.ref('products/' + product.id).remove()
                    .then(() => {
                        console.log('Xóa sản phẩm thành công');
                    })
                    .catch((error) => {
                        console.error('Lỗi khi xóa sản phẩm:', error);
                        alert('Có lỗi xảy ra khi xóa sản phẩm');
                    });
            });
    
            productDiv.appendChild(detailButton);
            productDiv.appendChild(deleteButton);
            productList.appendChild(productDiv);
        }
    
        updatePagination(Math.ceil(filteredProducts.length / productsPerPage));
    }

    function updatePagination(totalPages) {
        const pagination = document.querySelector('.pagination');
        const pageInfo = document.getElementById('pageInfo');
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
        prevButton.disabled = currentPage === 1; nextButton.disabled = currentPage === totalPages;

        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderProductList();
            }
        };
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProductList();
            }
        };

        pagination.style.display = totalPages > 1 ? 'block' : 'none';
    }

    function resetForm() {
        document.getElementById('productName').value = '';
        document.getElementById('productCategory').value = '';
        variantContainer.innerHTML = '';
        renderProductList();
    }

    document.getElementById('addVariantButton').addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('variant-input');
        input.placeholder = 'Nhập phân loại';

        const deleteVariantButton = document.createElement('button');
        deleteVariantButton.textContent = 'Xóa';
        deleteVariantButton.classList.add('delete-variant-button');
        deleteVariantButton.addEventListener('click', () => {
            variantContainer.removeChild(input);
            variantContainer.removeChild(deleteVariantButton);
        });

        variantContainer.appendChild(input);
        variantContainer.appendChild(deleteVariantButton);
    });

    searchBar.addEventListener('input', renderProductList);
    categorySelect.addEventListener('change', renderProductList);

    importButton.addEventListener('click', function() {
        uploadExcel.click();
    });

    uploadExcel.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert('Vui lòng chọn file Excel để nhập.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                let importCount = 0;
                let skipCount = 0;

                jsonData.forEach((row, index) => {
                    if (index === 0) return; // Bỏ qua dòng tiêu đề
                    if (row.length >= 2) {
                        const productName = row[0]?.toString().trim();
                        const productCategory = row[1]?.toString().trim();

                        if (!productName || !productCategory) return;

                        // Kiểm tra trùng lặp
                        const exists = products.some(product => 
                            product.name.toLowerCase() === productName.toLowerCase()
                        );

                        if (exists) {
                            skipCount++;
                            return;
                        }

                        // Thêm sản phẩm mới vào Firebase
                        const newProductRef = database.ref('products').push();
                        newProductRef.set({
                            name: productName,
                            category: productCategory,
                            variants: row.slice(2).filter(v => v !== undefined && v !== null && v.toString().trim() !== '')
                        });

                        importCount++;
                    }
                });

                alert(`Nhập dữ liệu từ Excel thành công!\nĐã thêm: ${importCount} sản phẩm\nBỏ qua: ${skipCount} sản phẩm trùng lặp`);
            } catch (error) {
                alert('Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra lại file và thử lại.');
                console.error(error);
            }
        };
        reader.onerror = (error) => {
            alert('Có lỗi xảy ra khi đọc file. Vui lòng thử lại.');
            console.error(error);
        };
        reader.readAsArrayBuffer(file);
    });

    // Lắng nghe thay đổi từ Firebase
    database.ref('products').on('value', (snapshot) => {
        const data = snapshot.val();
        products.length = 0; // Xóa mảng hiện tại
        
        if (data) {
            Object.keys(data).forEach(key => {
                products.push({
                    id: key,
                    ...data[key]
                });
            });
        }
        
        renderProductList();
    });

    addProductButton.addEventListener('click', addProduct);
});
database.ref('products').push(product, (error) => {
    if (error) {
        console.log("Lỗi khi đẩy dữ liệu: ", error);
    } else {
        console.log("Đẩy dữ liệu thành công!");
    }
});
