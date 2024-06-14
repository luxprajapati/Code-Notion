import { useEffect } from "react";

// This hook detects clicks outside of a specified component and calls the provided handler function.
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    // Define the listener function to be called on click/touch events
    const listener = (event) => {
      // Do nothing if the event is inside the component
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // Call the handler function if the event is outside the component
      handler(event);
    };

    // add event listener for mousedown and touchstart events on the document
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // Clean up  the function to remove the event listeners when the component is unmounted or when the ref/handler dependencies change
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Only run the effect when the ref or handler function changes
};

export default useOnClickOutside;
