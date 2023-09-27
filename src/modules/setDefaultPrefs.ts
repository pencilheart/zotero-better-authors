import { clearPref, getPref, setPref } from "../utils/prefs";

export function setDefaultPrefSettings() {
  if (typeof getPref("middle_n_authors") === "undefined") {
    setPref("middle_n_authors", 0);
  }

  if (typeof getPref("include-firstauthor-in-list") === "undefined") {
    setPref("include-firstauthor-in-list", true);
  }

  if (typeof getPref("include-middleauthors-in-list") === "undefined") {
    setPref("include-middleauthors-in-list", false);
  }

  if (typeof getPref("include-lastauthor-in-list") === "undefined") {
    setPref("include-lastauthor-in-list", true);
  }

  if (typeof getPref("sep-intra-author") === "undefined") {
    setPref("sep-intra-author", " ");
  }

  if (typeof getPref("sep-inter-author") === "undefined") {
    setPref("sep-inter-author", ", ");
  }

  if (typeof getPref("sep-before-lastauthor") === "undefined") {
    setPref("sep-before-lastauthor", "*");
  }
}