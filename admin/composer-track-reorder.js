document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#composer-track-order-list");
  const saveButton = document.querySelector(
    "#composer-track-save-order",
  );
  const status = document.querySelector(
    "#composer-track-order-status",
  );

  if (!list || !saveButton || !status) {
    return;
  }

  let draggedItem = null;

  const getItems = () =>
    Array.from(
      list.querySelectorAll(".composer-track-order-item"),
    );

  const updateOrder = () => {
    getItems().forEach((item, index) => {
      item.dataset.position = index;
    });
  };

  list.addEventListener("dragstart", (event) => {
    const item = event.target.closest(
      ".composer-track-order-item",
    );

    if (!item) {
      return;
    }

    draggedItem = item;
    item.classList.add("is-dragging");

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      item.dataset.trackId,
    );
  });

  list.addEventListener("dragend", () => {
    if (!draggedItem) {
      return;
    }

    draggedItem.classList.remove("is-dragging");
    draggedItem = null;

    getItems().forEach((item) => {
      item.classList.remove("is-drag-over");
    });
  });

  list.addEventListener("dragover", (event) => {
    event.preventDefault();

    if (!draggedItem) {
      return;
    }

    const target = event.target.closest(
      ".composer-track-order-item",
    );

    if (!target || target === draggedItem) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    target.classList.add("is-drag-over");

    if (event.clientY < midpoint) {
      list.insertBefore(draggedItem, target);
    } else {
      list.insertBefore(
        draggedItem,
        target.nextElementSibling,
      );
    }

    updateOrder();
  });

  list.addEventListener("dragleave", (event) => {
    const target = event.target.closest(
      ".composer-track-order-item",
    );

    if (target) {
      target.classList.remove("is-drag-over");
    }
  });

  list.addEventListener("drop", (event) => {
    event.preventDefault();

    getItems().forEach((item) => {
      item.classList.remove("is-drag-over");
    });

    updateOrder();
  });

  saveButton.addEventListener("click", async () => {
    const order = getItems().map(
      (item) => item.dataset.trackId,
    );

    saveButton.disabled = true;
    status.textContent = "Saving…";

    try {
      const body = new URLSearchParams();

      body.set("action", "save_track_order");
      body.set(
        "nonce",
        window.ComposerTrackOrder.nonce,
      );
      body.set("order", JSON.stringify(order));

      const response = await fetch(
        window.ComposerTrackOrder.ajaxUrl,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body,
        },
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.data?.message || "Unable to save track order.",
        );
      }

      status.textContent = "Order saved.";
    } catch (error) {
      console.error(error);
      status.textContent =
        error.message || "Unable to save track order.";
    } finally {
      saveButton.disabled = false;
    }
  });

  updateOrder();
});
