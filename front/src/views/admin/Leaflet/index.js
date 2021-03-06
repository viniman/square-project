import React, { Component } from "react";
import {
  LayersControl,
  Map,
  Marker,
  Popup,
  TileLayer,
  Polygon,
} from "react-leaflet";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "../../../components/website/CustomButtons/Button.js";
import Control from "react-leaflet-control";

import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
//import json que cria os forms
import schema from "../../../forms/example/schema.json";
import uischema from "../../../forms/example/uischema.json";

import axios from "axios";

const { BaseLayer, Overlay } = LayersControl;

type State = {
  lat: number,
  lng: number,
  zoom: number,
};

const center = [-21.7642, -43.3496];

export default class Leaflet extends Component<{}, State> {
  state = {
    lat: -21.7642,
    lng: -43.3496,
    zoom: 13,
    currentPolygon: [],
    polygonList: [
      {
        id: 0,
        coordinates: [
          [-21.784528085620426, -43.35050582885743],
          [-21.751368561385405, -43.33505630493164],
          [-21.740845188197625, -43.38140487670899],
          [-21.773210071085067, -43.38277816772462],
        ],
      },
    ],
    drawActive: false,
    register: {
      open: false,
    },
    data: {},
  };

  handleClick(e) {
    if (this.state.drawActive) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      this.setState((state) => {
        return { currentPolygon: state.currentPolygon.concat([newPos]) };
      });
    }
  }

  startDraw() {
    this.setState({ drawActive: true });
  }

  addPolygon() {
    this.setState({ drawActive: false });

    if (this.state.currentPolygon.length > 2) {
      this.setState((state) => {
        return {
          drawActive: false,
          polygonList: state.polygonList.concat({
            id: state.polygonList.length,
            coordinates: state.currentPolygon,
          }),
        };
      });
    }
    this.clearDraw();
  }

  clearDraw() {
    this.setState({ currentPolygon: [] });
  }

  registerDialogOpen() {
    this.setState({ register: { open: true } });
  }
  registerDialogClose() {
    this.setState({ register: { open: false } });
  }

  sendSquareRegister() {
    var data = this.state.data;

    var submitAddresses = {
      addresses: [],
    };

    var submitLocal = {
      locals: [],
    };

    for (var i in data.address.Endereço) {
      submitAddresses.addresses.push({
        UF: data.address.Endereço[i]["estado"],
        city: data.address.Endereço[i]["cidade"],
        neighborhood: data.address.Endereço[i]["bairro"],
        street: data.address.Endereço[i]["Rua"],
        number: data.address.Endereço[i]["Número"],
      });
    }

    var tipo = 0;

    switch (data.tipo) {
      case "Canteiros centrais e laterais de porte":
        tipo = 1;
        break;
      case "Cantos de quadra":
        tipo = 2;
        break;
      case "Jardim":
        tipo = 3;
        break;
      case "Largo":
        tipo = 4;
        break;
      case "Mirante":
        tipo = 5;
        break;
      case "Praça":
        tipo = 6;
        break;
      case "Praça (cercada)":
        tipo = 7;
        break;
      case "Terreno não ocupado":
        tipo = 8;
        break;
      case "Terrenos remanescentes de sistema viário e parcelamento do solo":
        tipo = 9;
        break;
      case "Rotatória":
        tipo = 10;
        break;
      case "Trevo":
        tipo = 11;
        break;
      default:
        tipo = -1;
        break;
    }

    var categorias = 0;

    switch (data.categorias) {
      case "de práticas sociais":
        categorias = 1;
        break;
      case "espaços livres privados de uso coletivo":
        categorias = 2;
        break;
      default:
        categorias = -1;
        break;
    }

    submitLocal.locals.push(
      {
        name: data.nome,
        common_name: data.nomePopular,
        type: tipo,
        free_space_category: categorias,
        comments: data.comentarios,
      }
    );

    //console.log(submitAddresses.addresses);

    //console.log(submitLocal);

    console.log(submitLocal.locals[0]);

    axios
      .post(`http://localhost:3333/addresses`, submitAddresses)
      .then((res) => {});

    axios.post(`http://localhost:3333/locals`, submitLocal.locals[0])
      .then((res) => {});
  }

  render() {
    const position = [this.state.lat, this.state.lng];

    return (
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Map
            center={position}
            zoom={this.state.zoom}
            style={{ height: "100vh", width: "100%" }}
            onClick={this.handleClick.bind(this)}
          >
            <Control position="topleft">
              <button
                onClick={this.startDraw.bind(this)}
                style={{ color: "#f00" }}
              >
                Começar Desenho
              </button>
            </Control>

            <Control position="topleft">
              <button onClick={this.addPolygon.bind(this)}>
                Adicionar Poligono
              </button>
            </Control>

            <Control position="topleft">
              <button onClick={this.clearDraw.bind(this)}>
                Descartar Desenho
              </button>
            </Control>

            <Marker position={center}>
              <Popup>
                <Button
                  type="button"
                  onClick={this.registerDialogOpen.bind(this)}
                  color="primary"
                  size="sm"
                  col
                >
                  Cadastrar praça
                </Button>
                <Dialog
                  fullWidth={true}
                  maxWidth={"md"}
                  open={this.state.register.open}
                  onClose={this.registerDialogClose.bind(this)}
                  aria-labelledby="max-width-dialog-title"
                >
                  <DialogTitle>Cadastrar Praça</DialogTitle>
                  <DialogContent dividers>
                    <JsonForms
                      schema={schema}
                      uischema={uischema}
                      renderers={materialRenderers}
                      cells={materialCells}
                      onChange={({ data, _errors }) =>
                        this.setState({ data: data })
                      }
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button
                      autoFocus
                      onClick={this.registerDialogClose.bind(this)}
                      color="primary"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={this.sendSquareRegister.bind(this)}
                      color="primary"
                    >
                      Confirmar
                    </Button>
                  </DialogActions>
                </Dialog>
              </Popup>
            </Marker>

            <TileLayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />

            <Polygon
              key="drawPolygon"
              positions={this.state.currentPolygon}
              color="blue"
            />
            {this.state.polygonList.map((polygon) => (
              <Polygon
                key={polygon.id}
                positions={polygon.coordinates}
                color="red"
              />
            ))}

            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </Map>
        </GridItem>
      </GridContainer>
    );
  }
}
