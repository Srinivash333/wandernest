// Wandernest Client Scripts
(() => {
    'use strict';

    // 1. Form Validation for Bootstrap
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach((form) => {
        form.addEventListener(
            'submit',
            (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            },
            false
        );
    });

    // 2. Tax Toggle Switch on Homepage
    const taxSwitch = document.getElementById('taxSwitch');
    if (taxSwitch) {
        taxSwitch.addEventListener('change', () => {
            const taxInfoElements = document.querySelectorAll('.tax-info');
            taxInfoElements.forEach((el) => {
                if (taxSwitch.checked) {
                    el.classList.remove('d-none');
                } else {
                    el.classList.add('d-none');
                }
            });
        });
    }

    // 3. Wishlist Heart Toggle
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    wishlistBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const heart = btn.querySelector('.wishlist-heart');
            if (heart) {
                heart.classList.toggle('text-danger');
                heart.classList.toggle('active-heart');
            }
        });
    });

    // 4. Interactive Star Rating Selector
    const starLabels = document.querySelectorAll('.star-label');
    starLabels.forEach((label) => {
        label.addEventListener('click', function () {
            const inputId = this.getAttribute('for');
            const input = document.getElementById(inputId);
            if (input) {
                input.checked = true;
                updateStarHighlight(parseInt(input.value));
            }
        });
    });

    function updateStarHighlight(val) {
        for (let i = 1; i <= 5; i++) {
            const lbl = document.querySelector(`label[for="rate${i}"] i`);
            if (lbl) {
                if (i <= val) {
                    lbl.classList.remove('opacity-25');
                    lbl.classList.add('text-warning');
                } else {
                    lbl.classList.remove('text-warning');
                    lbl.classList.add('opacity-25');
                }
            }
        }
    }
})();