document.addEventListener("DOMContentLoaded", () => {
  let audioMediaFrame;
  let imageMediaFrame;

  const selectAudioButton = document.querySelector(
    ".composer-track-select-audio",
  );
  const removeAudioButton = document.querySelector(
    ".composer-track-remove-audio",
  );
  const audioField = document.querySelector("#composer_track_audio");
  const audioName = document.querySelector("#composer-track-audio-name");

  const selectImageButton = document.querySelector(
    ".composer-track-select-image",
  );
  const removeImageButton = document.querySelector(
    ".composer-track-remove-image",
  );
  const imageField = document.querySelector("#composer_track_image");
  const imagePreview = document.querySelector(
    "#composer-track-image-preview",
  );

  /*
   * Audio picker
   */
  if (
    selectAudioButton &&
    removeAudioButton &&
    audioField &&
    audioName
  ) {
    selectAudioButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (!audioMediaFrame) {
        audioMediaFrame = wp.media({
          title: "Select Audio File",
          button: {
            text: "Use This Audio File",
          },
          library: {
            type: "audio",
          },
          multiple: false,
        });

        audioMediaFrame.on("select", () => {
          const attachment = audioMediaFrame
            .state()
            .get("selection")
            .first()
            .toJSON();

          audioField.value = attachment.id;
          audioName.textContent =
            attachment.filename || attachment.title;

          audioName.hidden = false;
          removeAudioButton.hidden = false;
        });
      }

      audioMediaFrame.open();
    });

    removeAudioButton.addEventListener("click", (event) => {
      event.preventDefault();

      audioField.value = "";
      audioName.textContent = "";
      audioName.hidden = true;
      removeAudioButton.hidden = true;
    });

    const form = audioField.closest("form");

    if (form) {
      form.addEventListener("submit", (event) => {
        if (!audioField.value) {
          event.preventDefault();
          alert("Please select an audio file before saving the track.");
          selectAudioButton.focus();
        }
      });
    }
  }

  /*
   * Image picker
   */
  if (
    selectImageButton &&
    removeImageButton &&
    imageField &&
    imagePreview
  ) {
    selectImageButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (!imageMediaFrame) {
        imageMediaFrame = wp.media({
          title: "Select Image",
          button: {
            text: "Use This Image",
          },
          library: {
            type: "image",
          },
          multiple: false,
        });

        imageMediaFrame.on("select", () => {
          const attachment = imageMediaFrame
            .state()
            .get("selection")
            .first()
            .toJSON();

          imageField.value = attachment.id;

          imagePreview.innerHTML = "";

          const image = document.createElement("img");
          image.src =
            attachment.sizes?.medium?.url || attachment.url;
          image.alt = attachment.alt || "";
          imagePreview.appendChild(image);

          imagePreview.hidden = false;
          removeImageButton.hidden = false;
        });
      }

      imageMediaFrame.open();
    });

    removeImageButton.addEventListener("click", (event) => {
      event.preventDefault();

      imageField.value = "";
      imagePreview.innerHTML = "";
      imagePreview.hidden = true;
      removeImageButton.hidden = true;
    });
  }
});