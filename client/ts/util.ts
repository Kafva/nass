/** Generic getter for DOM elements */
function GetHTMLElement<Type extends Element>(selector:string): Type {
  const el = document.querySelector(selector) as Type;
  if (el == undefined) {
    throw `No element found matching ${selector}`
  }
  return el
}

/** Generic getter for multiple DOM elements */
function GetHTMLElements<Type extends Element>(selector:string, root: Element):
 NodeListOf<Type> {
  const el = root.querySelectorAll(selector) as NodeListOf<Type>;
  if (el == undefined) {
    throw `No elements found matching ${selector}`
  }
  return el
}

function ToggleDialog(dialog: HTMLDialogElement, modalCover: HTMLDivElement,
  hide: boolean) {
  modalCover.hidden = hide
  if (hide){
    dialog.close()
  } else {
    dialog.show();
  }
}



export {GetHTMLElement, GetHTMLElements, ToggleDialog}
