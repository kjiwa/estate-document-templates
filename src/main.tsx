import { render } from "preact";

import "./styles/fonts.css";
import "./styles/tokens.css";
import "./styles/app.css";
import "./styles/document-content.css";
import "./styles/document-paper.css";
import "./styles/document-reading.css";
import "./styles/print.css";

import { App } from "./App";
import { installPrintPresentationSwitch } from "./ui/presentation";
import { installPrintLabels } from "./ui/print";
import { installStorageSync, loadFromStorage } from "./store/index";

loadFromStorage();
installPrintPresentationSwitch();
installPrintLabels();
installStorageSync();

const root = document.getElementById("app");
if (root) render(<App />, root);
