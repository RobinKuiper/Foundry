let playerActors = game.actors.filter((x) => x.hasPlayerOwner);

if (playerActors.length > 0) {
  let actor1 = playerActors[0].data.data;

  let folderOptions = `<option value="-1">None</option>\n`;
  let folders = game.folders
    .filter((x) => x.type === "JournalEntry")
    .forEach((folder) => {
      folderOptions += `<option value="${folder.id}">${folder.name}</option>\n`;
    });

  let playerActorOptions = "";
  playerActors.forEach((x) => {
    playerActorOptions += `<option value="${x.id}">${x.name}</option>\n`;
  });

  let filters = "";
  Object.keys(actor1).forEach((key) => {
    filters += `<optgroup label="${key}">`;
    Object.keys(actor1[key])
      .sort((a, b) => {
        if (a.toUpperCase() < b.toUpperCase()) {
          return 1;
        } else {
          return -1;
        }
      })
      .sort((a, b) => {
        if (typeof actor1[key][a] === "object") {
          return -1;
        } else {
          return 1;
        }
      })
      .forEach((key2) => {
        if (typeof actor1[key][key2] === "object") {
          filters += `<optgroup label="⮞ ${key2}" style="padding-left: 20px; cursor: pointer;" class="optgroup-with-children">`;

          Object.keys(actor1[key][key2]).forEach((key3) => {
            filters += `<option value="${key}.${key2}.${key3}" style="display: none; cursor: auto;">${key3}</option>`;
          });

          filters += `</optgroup>`;
        } else
          filters += `<option value="${key}.${key2}" style="padding-left: 20px">${key2}</option>`;
      });
    filters += `</optgroup>`;
  });

  let dialog = new Dialog({
    title: "Actors",
    content: `
    <form id="form">
        <div class="form-group">
            <label for="name">Journal Entry Name:</label>
            <input type="string" id="name" name="name" placeholder="Character Overview" />
        </div>
        
        <div class="form-group">
            <label for="folder">Folder:</label>
            <select name="folder" id="folder">
                ${folderOptions}
            </select>
        </div>

        <div class="form-group">
            <label for="show">Show Players?:</label>
            <input type="checkbox" name="show" id="show" />
        </div>
        
        <div class="form-group">
            <label for="overwrite">Overwrite?: <br> <sup>if exists</sup></label>
            <input type="checkbox" name="overwrite" id="overwrite" checked />
        </div>

        <div class="form-group">
            <label for="actors">Actors: <br /> <sup>Select multiple by holding CTRL.</sup></label>
            <select name="actors" id="actors" multiple>
                ${playerActorOptions}
            </select>
        </div>
        
        <hr>
        
        <div class="form-group">
            <label for="attributes">Attributes: <br /> <sup>Select multiple by holding CTRL.</sup></label>
            <select name="attributes" id="attributes" size="25" multiple>
                ${filters}
            </select>
        </div>
    </form>
  `,
    buttons: {
      create: {
        label: "Create",
        callback: (html) => {
          let name = html.find("[id=name]")[0].value || "Character Overview";
          let actorOptions = html.find("[id=actors]")[0].options;
          let folder = html.find("[id=folder]")[0].value;
          let attributeOptions = html.find("[id=attributes]")[0].options;
          let show = html.find("[id=show]")[0].checked ? true : false;
          let overwrite = html.find("[id=overwrite]")[0].checked ? true : false;

          let table = `
          <table>
            <tr>
                <th style="text-align: left;">Name</th>`;

          for (let i = 0; i < attributeOptions.length; i++) {
            if (attributeOptions[i].selected) {
              table += `
                <th style="text-align: left;">${
                  attributeOptions[i].value.split(".")[1]
                }</th>
                `;
            }
          }

          table += `
            </tr>
          `;

          for (let i = 0; i < actorOptions.length; i++) {
            if (actorOptions[i].selected) {
              let actor = game.actors.get(actorOptions[i].value);
              let data = actor.data.data;

              table += `
                <tr><td>@Actor[${actorOptions[i].value}]</td>
                `;

              for (let i = 0; i < attributeOptions.length; i++) {
                if (attributeOptions[i].selected) {
                  let attr = attributeOptions[i].value.split(".");

                  if (attr.length === 2) {
                    table += `
                            <td>${data[attr[0]][attr[1]]}</td>
                            `;
                  } else {
                    table += `
                            <td>${data[attr[0]][attr[1]][attr[2]]}</td>
                            `;
                  }
                }
              }

              table += "</tr>";
            }
          }

          table += `
          </table>`;

          let existingJournalEntry = game.journal.filter((x) => {
            folder = folder === "-1" ? null : folder;
            return (
              ((x.folder && x.folder.id === folder) || !x.folder) &&
              x.name === name
            );
          });

          if (overwrite && existingJournalEntry.length > 0) {
            //JournalEntry.delete(existingJournalEntry[0].id);

            let perm = duplicate(existingJournalEntry[0].data.permission);
            perm.default = show ? 2 : 0;

            existingJournalEntry[0]
              .update({ content: table, permission: perm })
              .then(() => {
                ui.notifications.notify(`Journal entry "${name}" updated.`);
              });
          } else {
            JournalEntry.create({
              name,
              folder,
              content: table,
            }).then((journal) => {
              if (show) {
                let perm = duplicate(journal.data.permission);
                perm.default = 2;
                journal.update({ permission: perm }).then(() => {
                  ui.notifications.notify(`Journal entry "${name}" created.`);
                });
              } else
                ui.notifications.notify(`Journal entry "${name}" created.`);
            });
          }
        },
      },
    },
    render: (html) => {
      let optgroups = document.getElementsByClassName("optgroup-with-children");
      for (var i = 0; i < optgroups.length; i++) {
        optgroups[i].onclick = (e) => {
          if (e.target.tagName === "OPTION") return;

          let label = e.target.getAttribute("label").split(" ")[1];
          let children = e.target.getElementsByTagName("option");

          for (var j = 0; j < children.length; j++) {
            if (children[j].style.display === "none") {
              children[j].style.display = "block";
              e.target.setAttribute("label", `⮟ ${label}`);
            } else {
              children[j].style.display = "none";
              e.target.setAttribute("label", `⮞ ${label}`);
            }
          }
        };
      }
    },
    close: (html) => {},
  });

  dialog.render(true);
}
