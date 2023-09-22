import { it } from "node:test";
import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { convertToInitials, determineCountry } from "./convertNames";
import { BasicTool } from "zotero-plugin-toolkit/dist/basic";

function lastAuthorPlugin(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any) {
    try {
      ztoolkit.log(`Calling last author ${target.name}.${String(propertyKey)}`);
      return original.apply(this, args);
    } catch (e) {
      ztoolkit.log(`Error in last author ${target.name}.${String(propertyKey)}`, e);
      throw e;
    }
  };
  return descriptor;
}

export class BasicLastAuthorFactory {
  @lastAuthorPlugin
  static registerPrefs() {
    const prefOptions = {
      pluginID: config.addonID,
      src: rootURI + "chrome/content/preferences.xhtml",
      label: getString("prefs-title"),
      image: "",
      defaultXUL: true,
    };
    ztoolkit.PreferencePane.register(prefOptions);
  }
}

export class UILastAuthorFactory {
  static displayAuthorName(authors: Zotero.Item.Creator[], index: number): string {
    if (authors.length == 0) return "";
    const targetAuthor = authors[index];
    // BasicTool.getZotero().log(targetAuthor.fieldMode)
    if (targetAuthor.fieldMode == 0) {
      // Double fields mode
      if (Zotero.Prefs.get("lastauthor.only_lastname")) {
        return targetAuthor.lastName as string;
      } else {
        let nameorder = "firstlast";
        let separtor = ", ";
        if (Zotero.Prefs.get("lastauthor.namestyle") == "auto") {
          const nameCountry = determineCountry(targetAuthor.firstName as string, targetAuthor.lastName as string);
          BasicTool.getZotero().log(nameCountry);
          if (["zh", "ja", "ko"].includes(nameCountry)) {
            nameorder = "lastfirst";
            separtor = "";
          }
        }
        if (Zotero.Prefs.get("lastauthor.namestyle") == "firstlast" || nameorder == "firstlast") {
          if (Zotero.Prefs.get("lastauthor.initials")) {
            return targetAuthor.lastName + separtor +
              convertToInitials(targetAuthor.firstName);
          } else {
            return targetAuthor.lastName + separtor + targetAuthor.firstName;
          }
        } else if (Zotero.Prefs.get("lastauthor.namestyle") == "lastfirst" || nameorder == "lastfirst") {
          if (Zotero.Prefs.get("lastauthor.initials")) {
            return convertToInitials(targetAuthor.firstName) + separtor +
              targetAuthor.lastName;
          } else {
            return targetAuthor.firstName + separtor + targetAuthor.lastName;
          }
        }
      }

    } else {
      // Single field mode should be used to institutions. Only lastName field has value.
      return targetAuthor.lastName as string;
    }
  }

  @lastAuthorPlugin
  static async registerExtraColumn() {
    await ztoolkit.ItemTree.register(
      "lastauthor",
      getString("itemtree-title"),
      (
        field: string,
        unformatted: boolean,
        includeBaseMapped: boolean,
        item: Zotero.Item,
      ) => {
        const authors = item.getCreators();
        if (authors.length == 0) return "";
        const lastAuthorDisplayed: string = this.displayAuthorName(authors, authors.length - 1);
        return lastAuthorDisplayed;
      },
      {},
    );
  }
}
