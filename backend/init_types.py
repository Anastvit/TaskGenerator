from db import get_session
from models import NodeType, EdgeType

session = get_session()

node_types = [
    NodeType(id=1, name="element"),
    NodeType(id=2, name="variable"),
    NodeType(id=3, name="array")
]

edge_types = [
    EdgeType(id=1, name="single", label="Одиночная"),
    EdgeType(id=2, name="multi", label="Множественная")
]

session.add_all(node_types)
session.add_all(edge_types)
session.commit()

print("Типы узлов и связей добавлены.")
