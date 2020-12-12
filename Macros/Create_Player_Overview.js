/*let journalEntry = JournalEntry.create({ name: "New Entry" }).then(x => { 
console.log("DO SHIT");
console.log(x) 
});*/

let options = "";
game.actors.forEach((x) => {
  options += `<option value="${x.id}">${x.name}</option>\n`;
});

let dialog = new Dialog({
  title: "Actors",
  content: `
    <form id="form">
        <div class="form-group">
            <label for="name">Journal Name:</label>
            <input type="string" id="name" name="name" placeholder="Character Overview" />
        </div>

        <div class="form-group">
            <label for="actors">Actors:</label>
            <select name="actors" id="actors" multiple>
                ${options}
            </select>
        </div>
    </form>
  `,
  buttons: {
    create: {
      label: "Create",
      callback: (html) => {
        let name = html.find("[id=name]")[0].value || "Character Overview";
        let options = html.find("[id=actors]")[0].options;
        let actorIds = [];

        for (let i = 0; i < options.length; i++) {
          if (options[i].selected) actorIds.push(options[i].value);
        }

        let actors = "";
        actorIds.forEach((id) => {
          let actor = game.actors.get(id);

          actors += `
            <tr>
                <td>${actor.name}</td>
                <td>${actor.data.data.details.race}</td>
                <td>${actor.data.data.details.alignment}</td>
                <td>${actor.data.data.attributes.inspiration ? "X" : ""}</td>
                <td>${actor.data.data.attributes.ac}</td>
                <td>${actor.data.data.attributes.hp.max}</td>
                <td>${actor.data.data.attributes.ac}</td>
            </tr>
            `;
        });

        let journalEntry = JournalEntry.create({
          name,
          content: `
          <table>
            <tr>
                <th>Name</th>
                <th>Race</th>
                <th>Alignment</th>
                <th>Inspiration</th>
                <th>AC</th>
                <th>HP</th>
            </tr>
              ${actors}
          </table>
        `,
        });
      },
    },
  },
  render: (html) => {},
  close: (html) => {},
});

dialog.render(true);
