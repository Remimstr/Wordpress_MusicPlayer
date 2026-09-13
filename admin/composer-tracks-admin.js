document.addEventListener("DOMContentLoaded", () => {
  let mediaFrame;

  const selectButton = document.querySelector(
    ".composer-track-select-audio",
  );
  const removeButton = document.querySelector(
    ".composer-track-remove-audio",
  );
  const audioField = document.querySelector("#composer_track_audio");
  const audioName = document.querySelector("#composer-track-audio-name");

  if (!selectButton || !removeButton || !audioField || !audioName) {
    return;
  }

  selectButton.addEventListener("click", (event) => {
    event.preventDefault();

    if (!mediaFrame) {
      mediaFrame = wp.media({
        title: "Select Audio File",
        button: {
          text: "Use This Audio File",
        },
        library: {
          type: "audio",
        },
        multiple: false,
      });

      mediaFrame.on("select", () => {
        const attachment = mediaFrame
          .state()
          .get("selection")
          .first()
          .toJSON();

        audioField.value = attachment.id;
        audioName.textContent =
          attachment.filename || attachment.title;

        audioName.hidden = false;
        removeButton.hidden = false;
      });
    }

    mediaFrame.open();
  });

  removeButton.addEventListener("click", (event) => {
    event.preventDefault();

    audioField.value = "";
    audioName.textContent = "";
    audioName.hidden = true;
    removeButton.hidden = true;
  });
});
