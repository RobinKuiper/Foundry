let dialogEditor = new Dialog({
  title: `Reduce/Enlarge`,
  content: `
  <form>
    <div class="form-group">
        <label for="modifier">Modifier</label>
        <input type="number" name="modifier" id="modifier" value="2" />
    </div>
  </form>`,
  buttons: {
    enlarge: {
      label: `<i class="fas fa-angle-double-up"></i> Enlarge`,
      callback: (html) => {
        let modifier = html.find("[id=modifier]")[0].value * 1 || 2;
        changeTokenSize(modifier, true);
        dialogEditor.render(true);
      },
    },
    reduce: {
      label: `<i class="fas fa-angle-double-down"></i> Reduce`,
      callback: (html) => {
        let modifier = html.find("[id=modifier]")[0].value * 1 || 2;
        changeTokenSize(modifier, false);
        dialogEditor.render(true);
      },
    },
  },
});

function changeTokenSize(modifier, enlarge = true) {
  if (canvas.tokens.controlled.length === 0) {
    ui.notifications.notify(`You don't have any tokens selected.`);
    return;
  }

  const updates = [];
  let height = 0,
    width = 0;
  for (let token of canvas.tokens.controlled) {
    height = enlarge
      ? token.data.height * modifier
      : token.data.height / modifier;
    width = enlarge ? token.data.width * modifier : token.data.width / modifier;
    updates.push({
      _id: token.id,
      height: height,
      width: width,
    });
  }

  canvas.tokens.updateMany(updates);
}

dialogEditor.render(true);
