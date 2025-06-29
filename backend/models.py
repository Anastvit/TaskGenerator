from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from pydantic import BaseModel


class Template(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    theme: Optional[str] = Field(default="Общая")
    nodes: list["Node"] = Relationship(back_populates="template")
    edges: list["Edge"] = Relationship(back_populates="template")


class NodeType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    nodes: list["Node"] = Relationship(back_populates="type")


class Node(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type_id: int = Field(foreign_key="nodetype.id")
    label: Optional[str]
    custom_json: Optional[str]
    is_root: bool = False
    template_id: int = Field(foreign_key="template.id")
    type: Optional["NodeType"] = Relationship(back_populates="nodes")
    template: Optional["Template"] = Relationship(back_populates="nodes")
    prev_edges: list["Edge"] = Relationship(back_populates="next_node", sa_relationship_kwargs={"foreign_keys": "[Edge.next_id]"})
    next_edges: list["Edge"] = Relationship(back_populates="prev_node", sa_relationship_kwargs={"foreign_keys": "[Edge.prev_id]"})


class EdgeType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    label: Optional[str]
    edges: list["Edge"] = Relationship(back_populates="type")


class Edge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    template_id: int = Field(foreign_key="template.id")
    prev_id: int = Field(foreign_key="node.id")
    next_id: int = Field(foreign_key="node.id")
    type_id: int = Field(foreign_key="edgetype.id")
    template: Optional["Template"] = Relationship(back_populates="edges")
    type: Optional["EdgeType"] = Relationship(back_populates="edges")
    prev_node: Optional["Node"] = Relationship(back_populates="next_edges", sa_relationship_kwargs={"foreign_keys": "[Edge.prev_id]"})
    next_node: Optional["Node"] = Relationship(back_populates="prev_edges", sa_relationship_kwargs={"foreign_keys": "[Edge.next_id]"})


class NodeIn(BaseModel):
    type_id: int
    label: Optional[str]
    custom_json: Optional[str]
    is_root: bool


class EdgeIn(BaseModel):
    prev_id: int
    next_id: int
    type_id: int


class TemplateFullIn(BaseModel):
    name: str
    theme: Optional[str] = "Общая"
    nodes: list[NodeIn]
    edges: list[EdgeIn]
