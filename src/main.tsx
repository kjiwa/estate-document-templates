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
import { loadFromStorage } from "./store/index";

loadFromStorage();
installPrintPresentationSwitch();

const root = document.getElementById("app");
if (root) render(<App />, root);
