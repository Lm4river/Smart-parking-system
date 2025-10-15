document.addEventListener('DOMContentLoaded', () => {
    const selectImageButton = document.getElementById('selectImageButton');
    const imageInput = document.getElementById('imageInput');
    const imageDisplay = document.getElementById('imageDisplay');
    let displayedImageFile = null;

    selectImageButton.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            // Kiểm tra xem file có phải là ảnh không
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validImageTypes.includes(file.type)) {
                alert('Hãy chọn tệp là ảnh có đuôi file (JPG, PNG, GIF).');
                imageInput.value = ''; 
                displayedImageFile = null;
                return;
            }

            const url = URL.createObjectURL(file);
            imageDisplay.src = url;
            imageDisplay.style.display = 'block';
            displayedImageFile = file;
        }
    });

    document.getElementById('extractButton').addEventListener('click', function() {
        if (!displayedImageFile) {
            alert('Hãy chọn một bức ảnh trước!');
            return;
        }

        const formData = new FormData();
        formData.append('image', displayedImageFile);

        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('The selected image is not a valid license plate. Please try again with a correct image.');
                return;
            }

            if (data.image && data.draw) {
                const processedImg = document.getElementById('processedImage');
                const drawImg = document.getElementById('drawImage');
                processedImg.src = `data:image/jpeg;base64,${data.image}`;
                drawImg.src = `data:image/jpeg;base64,${data.draw}`;
                processedImg.style.display = 'block';
                drawImg.style.display = 'block';

                const container = document.getElementById('character-container');
                const predict = data.predictions;

                let html = '';
                predict.forEach(char => {
                    html += `<span>${char}</span>`;
                });

                const result = html.replace(/,/g, '');
                container.innerHTML = result;

            } else {
                console.error('Unexpected response structure:', data);
                alert('Ảnh không đúng hãy chọn ảnh khác!!!');
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        });
    });
});
