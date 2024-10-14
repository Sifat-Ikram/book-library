// DOM Elements
const bookList = document.getElementById("bookList");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");
const pagination = document.getElementById("pagination");

let books = [];
let currentPage = 1;
let itemsPerPage = 31;
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// Fetch books from Gutendex API
async function fetchBooks(page = 1) {
  try {
    const response = await fetch(`https://gutendex.com/books?page=${page}`);
    const data = await response.json();
    books = data.results;
    populateGenreFilter();
    renderBooks();
    setupPagination(data.count);
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

// Populate the genre dropdown based on fetched book data
function populateGenreFilter() {
  let genres = new Set();
  books.forEach((book) =>
    book.subjects.forEach((subject) => genres.add(subject))
  );
  genreFilter.innerHTML = `<option value="">Filter by Genre</option>`;
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Render books to the DOM
function renderBooks() {
  const filteredBooks = books
    .filter((book) =>
      book.title.toLowerCase().includes(searchInput.value.toLowerCase())
    )
    .filter(
      (book) => !genreFilter.value || book.subjects.includes(genreFilter.value)
    );

  if (filteredBooks.length === 0) {
    bookList.innerHTML = `<p>No books found</p>`;
  } else {
    bookList.innerHTML = filteredBooks
      .map(
        (book) => `
      <div class="book-card">
        <img src="${book.formats["image/jpeg"] || "default.jpg"}" alt="${
          book.title
        }">
        <h3>${book.title}</h3>
        <p>Author: ${book.authors.map((author) => author.name).join(", ")}</p>
        <p>Genres: ${book.subjects ? book.subjects.join(", ") : "N/A"}</p>
        <div class="buttons">
        <button onclick="toggleWishlist(${book.id})" class="wishlist-btn">
          <span class="heart-icon">${
            wishlist.includes(book.id) ? "❤️" : "♡"
          }</span> Add to Wishlist
        </button>
        <button onclick="viewDetails(${book.id})">View Details</button>
        </div>
      </div>`
      )
      .join("");
      
  }
  
}

function viewDetails(bookId) {
  window.location.href = `/book-details.html?id=${bookId}`;
}

// Search functionality
searchInput.addEventListener("input", renderBooks);

// Filter by genre
genreFilter.addEventListener("change", renderBooks);

// Wishlist functionality
function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter((item) => item !== id);
  } else {
    wishlist.push(id);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  renderBooks();
}

// Pagination
function setupPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationLimit = 5; // Number of buttons to show at once
  const halfLimit = Math.floor(paginationLimit / 2);

  pagination.innerHTML = "";

  // Previous Button
  pagination.innerHTML += `<button class="pagination-btn" onclick="goToPage(${
    currentPage - 1
  })" ${currentPage === 1 ? "disabled" : ""}>Previous</button>`;

  let startPage = Math.max(1, currentPage - halfLimit);
  let endPage = Math.min(totalPages, currentPage + halfLimit);

  // Ensure pagination stays within limits
  if (currentPage <= halfLimit) {
    endPage = Math.min(totalPages, paginationLimit);
  } else if (currentPage + halfLimit > totalPages) {
    startPage = Math.max(1, totalPages - paginationLimit + 1);
  }

  // Display page buttons
  for (let i = startPage; i <= endPage; i++) {
    pagination.innerHTML += `<button class="pagination-btn ${
      i === currentPage ? "active" : ""
    }" onclick="goToPage(${i})">${i}</button>`;
  }

  // Next Button
  pagination.innerHTML += `<button class="pagination-btn" onclick="goToPage(${
    currentPage + 1
  })" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`;
}

// Navigate to the selected page
function goToPage(page) {
  currentPage = page;
  fetchBooks(page);
}

// Initialize the app
fetchBooks(currentPage);
